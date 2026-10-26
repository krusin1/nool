import { randomBytes, timingSafeEqual } from 'node:crypto';
import { db } from '../db.ts';

export function getSetting(key: string): string | undefined {
	return (db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as { value: string } | undefined)?.value;
}

export function setSetting(key: string, value: string) {
	db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').run(key, value);
}

export function deleteSetting(key: string) {
	db.prepare('DELETE FROM settings WHERE key = ?').run(key);
}

/** Token other apps use to send work into Nool. Created on first use. */
export function inboxToken(): string {
	let token = getSetting('inbox_token');
	if (!token) {
		token = 'nool_' + randomBytes(18).toString('base64url');
		setSetting('inbox_token', token);
	}
	return token;
}

export function rotateInboxToken(): string {
	setSetting('inbox_token', 'nool_' + randomBytes(18).toString('base64url'));
	return inboxToken();
}

export function checkToken(header: string | null): boolean {
	const given = Buffer.from((header ?? '').replace(/^Bearer\s+/i, ''));
	const expected = Buffer.from(inboxToken());
	return given.length === expected.length && timingSafeEqual(given, expected);
}
