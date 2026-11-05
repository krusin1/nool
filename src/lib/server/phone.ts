import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import { networkInterfaces } from 'node:os';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import QRCode from 'qrcode';
import { db } from './db.ts';
import { resolveProject, resolveStage } from './inbox.ts';
import { addBlock } from './repo/blocks.ts';
import { getSetting, setSetting } from './repo/settings.ts';
import { saveBytes, MAX_AUDIO } from './uploads.ts';
import { blockData, blockType } from './validate.ts';
import { PHONE_PAGE } from './phone-page.ts';

// Phone capture. Off by default. When on, a second small server listens on this computer's
// Wi-Fi address. It serves one capture page and can only add blocks: it cannot read, change
// or delete anything. Every request needs the pairing key carried in the QR code.

export const PHONE_PORT = Number(process.env.PORT ?? 5173) + 1;
let server: Server | null = null;

const key = () => {
	let k = getSetting('phone_key');
	if (!k) setSetting('phone_key', (k = randomBytes(12).toString('base64url')));
	return k;
};

export const phoneEnabled = () => getSetting('phone') === 'on';

/** Private network addresses of this computer, Wi-Fi/Ethernet first. */
export function lanAddress(): string | null {
	const all = Object.values(networkInterfaces())
		.flat()
		.filter((a) => a && a.family === 'IPv4' && !a.internal)
		.map((a) => a!.address);
	return all.find((a) => /^192\.168\./.test(a)) ?? all.find((a) => /^10\./.test(a)) ?? all.find((a) => /^172\.(1[6-9]|2\d|3[01])\./.test(a)) ?? all[0] ?? null;
}

export async function phoneStatus() {
	const ip = lanAddress();
	const url = ip ? `http://${ip}:${PHONE_PORT}/#${key()}` : null;
	return {
		enabled: phoneEnabled(),
		running: !!server?.listening,
		url,
		qr: url ? await QRCode.toString(url, { type: 'svg', margin: 0, color: { dark: '#111111', light: '#0000' } }) : null
	};
}

export async function setPhone(on: boolean) {
	setSetting('phone', on ? 'on' : 'off');
	if (on) await startPhone();
	else stopPhone();
}

export function newPhoneKey() {
	setSetting('phone_key', randomBytes(12).toString('base64url'));
}

export function startPhone(): Promise<void> {
	if (server || !phoneEnabled()) return Promise.resolve();
	return new Promise((resolve) => {
		const s = createServer(handle);
		s.on('error', (e) => {
			console.warn('[nool] phone capture could not start:', (e as Error).message);
			server = null;
			resolve();
		});
		s.listen(PHONE_PORT, '0.0.0.0', () => resolve());
		server = s;
	});
}

export function stopPhone() {
	server?.close();
	server = null;
}

// --- requests ---

function send(res: ServerResponse, status: number, body: unknown, type = 'application/json') {
	res.writeHead(status, { 'content-type': type, 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' });
	res.end(type === 'application/json' ? JSON.stringify(body) : body);
}

function authorized(req: IncomingMessage) {
	const given = Buffer.from(String(req.headers['x-nool-key'] ?? ''));
	const want = Buffer.from(key());
	return given.length === want.length && timingSafeEqual(given, want);
}

function read(req: IncomingMessage, limit: number): Promise<Buffer> {
	return new Promise((resolve, reject) => {
		const parts: Buffer[] = [];
		let size = 0;
		req.on('data', (c: Buffer) => {
			size += c.length;
			if (size > limit) {
				reject(new Error('Too large'));
				req.destroy();
			} else parts.push(c);
		});
		req.on('end', () => resolve(Buffer.concat(parts)));
		req.on('error', reject);
	});
}

async function handle(req: IncomingMessage, res: ServerResponse) {
	const path = (req.url ?? '/').split('?')[0];
	try {
		if (req.method === 'GET' && (path === '/' || path === '/index.html')) return send(res, 200, PHONE_PAGE, 'text/html; charset=utf-8');
		if (!authorized(req)) return send(res, 401, { message: 'Scan the QR code in Nool again.' });

		if (req.method === 'GET' && path === '/projects') {
			const rows = db
				.prepare(
					`SELECT p.id, p.title, s.id AS sid, s.name FROM projects p JOIN stages s ON s.project_id = p.id
					 ORDER BY p.updated_at DESC, s.position`
				)
				.all() as { id: string; title: string; sid: string; name: string }[];
			const projects: { id: string; title: string; stages: { id: string; name: string }[] }[] = [];
			for (const r of rows) {
				let p = projects.find((x) => x.id === r.id);
				if (!p) projects.push((p = { id: r.id, title: r.title, stages: [] }));
				p.stages.push({ id: r.sid, name: r.name });
			}
			return send(res, 200, { projects });
		}

		if (req.method === 'POST' && path === '/upload') {
			const type = String(req.headers['content-type'] ?? '');
			const src = await saveBytes(await read(req, MAX_AUDIO), type);
			return send(res, 201, { src });
		}

		if (req.method === 'POST' && path === '/block') {
			const b = JSON.parse((await read(req, 200_000)).toString('utf8') || '{}');
			const project = resolveProject(String(b.project ?? ''));
			const stage = resolveStage(project, String(b.stage ?? '') || undefined);
			const type = blockType(b.type);
			addBlock({ project_id: project.id, stage_id: stage.id, type, data: blockData(type, b.data), source: 'Phone' });
			return send(res, 201, { project: project.title, stage: stage.name });
		}
		send(res, 404, { message: 'Not found' });
	} catch (e) {
		const err = e as { status?: number; body?: { message?: string }; message?: string };
		send(res, err.status ?? 400, { message: err.body?.message ?? err.message ?? 'Something went wrong' });
	}
}
