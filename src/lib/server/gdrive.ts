import { createHash, randomBytes } from 'node:crypto';
import { existsSync } from 'node:fs';
import { createBackup, backupName, restoreBackup } from './backup.ts';
import { deleteSetting, getSetting, setSetting } from './repo/settings.ts';

// Google Drive backup. Nool asks only for the `drive.file` scope, so it can see and
// change only the files it creates itself (a "Nool backups" folder), nothing else in Drive.
// The OAuth client comes from GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET (a Desktop app client).
// Tokens are stored in the local database on this computer and nowhere else.

// A local .env (never committed) can hold the OAuth client for development.
if (existsSync('.env')) process.loadEnvFile('.env');
const env = process.env;

const SCOPE = 'https://www.googleapis.com/auth/drive.file';
const FOLDER = 'Nool backups';
const KEEP = 10;
const DAY = 24 * 60 * 60 * 1000;

interface Tokens {
	access_token: string;
	refresh_token: string;
	expires_at: number;
	email?: string;
	folder_id?: string;
}

export interface DriveBackup {
	id: string;
	name: string;
	createdTime: string;
	size: number;
}

export const driveConfigured = () => !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);

const load = (): Tokens | null => {
	const raw = getSetting('google_drive');
	return raw ? JSON.parse(raw) : null;
};
const save = (t: Tokens) => setSetting('google_drive', JSON.stringify(t));

// --- OAuth (authorization code with PKCE, loopback redirect) ---

const pending = new Map<string, { verifier: string; redirect: string; at: number }>();

export function authUrl(origin: string): string {
	if (!driveConfigured()) throw new Error('Google Drive backup is not set up in this build.');
	const state = randomBytes(16).toString('base64url');
	const verifier = randomBytes(32).toString('base64url');
	const redirect = `${origin}/api/backup/google/callback`;
	pending.set(state, { verifier, redirect, at: Date.now() });
	const q = new URLSearchParams({
		client_id: env.GOOGLE_CLIENT_ID!,
		redirect_uri: redirect,
		response_type: 'code',
		scope: SCOPE,
		access_type: 'offline',
		prompt: 'consent',
		state,
		code_challenge: createHash('sha256').update(verifier).digest('base64url'),
		code_challenge_method: 'S256'
	});
	return `https://accounts.google.com/o/oauth2/v2/auth?${q}`;
}

async function tokenRequest(body: Record<string, string>) {
	const res = await fetch('https://oauth2.googleapis.com/token', {
		method: 'POST',
		headers: { 'content-type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({ client_id: env.GOOGLE_CLIENT_ID!, client_secret: env.GOOGLE_CLIENT_SECRET!, ...body })
	});
	const json = await res.json();
	if (!res.ok) throw new Error(json.error_description ?? json.error ?? 'Google sign-in failed');
	return json as { access_token: string; refresh_token?: string; expires_in: number };
}

export async function finishAuth(state: string, code: string) {
	const p = pending.get(state);
	pending.delete(state);
	if (!p || Date.now() - p.at > 10 * 60 * 1000) throw new Error('Sign-in expired. Start again from Nool.');
	const t = await tokenRequest({ grant_type: 'authorization_code', code, code_verifier: p.verifier, redirect_uri: p.redirect });
	if (!t.refresh_token) throw new Error('Google did not return a refresh token. Try connecting again.');
	const tokens: Tokens = { access_token: t.access_token, refresh_token: t.refresh_token, expires_at: Date.now() + t.expires_in * 1000 };
	save(tokens);
	tokens.email = await drive<{ user?: { emailAddress?: string } }>('/about?fields=user')
		.then((a) => a.user?.emailAddress)
		.catch(() => undefined);
	save(tokens);
}

export async function disconnect() {
	const t = load();
	deleteSetting('google_drive');
	if (t) await fetch(`https://oauth2.googleapis.com/revoke?token=${t.refresh_token}`, { method: 'POST' }).catch(() => {});
}

async function accessToken(): Promise<string> {
	const t = load();
	if (!t) throw new Error('Google Drive is not connected.');
	if (Date.now() < t.expires_at - 60_000) return t.access_token;
	const r = await tokenRequest({ grant_type: 'refresh_token', refresh_token: t.refresh_token });
	t.access_token = r.access_token;
	t.expires_at = Date.now() + r.expires_in * 1000;
	save(t);
	return t.access_token;
}

// --- Drive API ---

async function drive<T>(path: string, init: RequestInit = {}, base = 'https://www.googleapis.com/drive/v3'): Promise<T> {
	const res = await fetch(base + path, {
		...init,
		headers: { authorization: `Bearer ${await accessToken()}`, ...init.headers }
	});
	if (!res.ok) {
		const err = await res.json().catch(() => ({}));
		throw new Error(err.error?.message ?? `Google Drive returned ${res.status}`);
	}
	return (res.headers.get('content-type')?.includes('json') ? res.json() : res.arrayBuffer()) as Promise<T>;
}

async function folderId(): Promise<string> {
	const t = load()!;
	if (t.folder_id) return t.folder_id;
	const q = encodeURIComponent(`name='${FOLDER}' and mimeType='application/vnd.google-apps.folder' and trashed=false`);
	const found = await drive<{ files: { id: string }[] }>(`/files?q=${q}&fields=files(id)`);
	const id =
		found.files[0]?.id ??
		(
			await drive<{ id: string }>('/files?fields=id', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ name: FOLDER, mimeType: 'application/vnd.google-apps.folder' })
			})
		).id;
	save({ ...load()!, folder_id: id });
	return id;
}

export async function listBackups(): Promise<DriveBackup[]> {
	const q = encodeURIComponent(`'${await folderId()}' in parents and trashed=false`);
	const r = await drive<{ files: (DriveBackup & { size: string })[] }>(
		`/files?q=${q}&orderBy=createdTime desc&fields=files(id,name,createdTime,size)&pageSize=50`
	);
	return r.files.map((f) => ({ ...f, size: Number(f.size) }));
}

export async function backupToDrive(): Promise<DriveBackup> {
	const data = createBackup();
	const boundary = `nool${randomBytes(8).toString('hex')}`;
	const meta = JSON.stringify({ name: backupName(), parents: [await folderId()], mimeType: 'application/gzip' });
	const body = Buffer.concat([
		Buffer.from(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${meta}\r\n--${boundary}\r\nContent-Type: application/gzip\r\n\r\n`),
		data,
		Buffer.from(`\r\n--${boundary}--`)
	]);
	const file = await drive<DriveBackup>(
		'/files?uploadType=multipart&fields=id,name,createdTime,size',
		{ method: 'POST', headers: { 'content-type': `multipart/related; boundary=${boundary}` }, body },
		'https://www.googleapis.com/upload/drive/v3'
	);
	setSetting('google_drive_last', new Date().toISOString());

	// Keep the most recent backups only.
	const all = await listBackups();
	for (const old of all.slice(KEEP)) await drive(`/files/${old.id}`, { method: 'DELETE' }).catch(() => {});
	return { ...file, size: Number(file.size) };
}

export async function restoreFromDrive(id: string) {
	const buf = await drive<ArrayBuffer>(`/files/${encodeURIComponent(id)}?alt=media`);
	return restoreBackup(Buffer.from(buf));
}

export function driveStatus() {
	const t = load();
	return {
		configured: driveConfigured(),
		connected: !!t,
		email: t?.email ?? null,
		auto: getSetting('google_drive_auto') === 'on',
		last: getSetting('google_drive_last') ?? null
	};
}

export function setAuto(on: boolean) {
	setSetting('google_drive_auto', on ? 'on' : 'off');
}

/** Daily automatic backup while Nool is open. Checks hourly. */
export function startAutoBackup() {
	const tick = () => {
		const s = driveStatus();
		if (!s.configured || !s.connected || !s.auto) return;
		if (s.last && Date.now() - Date.parse(s.last) < DAY) return;
		backupToDrive().catch((e) => console.warn('[nool] automatic Drive backup failed:', e.message));
	};
	setTimeout(tick, 30_000);
	setInterval(tick, 60 * 60 * 1000).unref();
}
