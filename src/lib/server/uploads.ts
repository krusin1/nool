import { writeFile, readFile } from 'node:fs/promises';
import { join, basename } from 'node:path';
import { UPLOAD_DIR, uid } from './db.ts';

export const MAX_UPLOAD = 15 * 1024 * 1024;

const TYPES: Record<string, string> = {
	'image/png': 'png',
	'image/jpeg': 'jpg',
	'image/gif': 'gif',
	'image/webp': 'webp',
	'image/svg+xml': 'svg',
	'image/avif': 'avif',
	'audio/webm': 'weba',
	'audio/ogg': 'ogg',
	'audio/mp4': 'm4a',
	'audio/x-m4a': 'm4a',
	'audio/aac': 'aac',
	'audio/mpeg': 'mp3',
	'audio/wav': 'wav',
	'audio/x-wav': 'wav'
};

const MIME: Record<string, string> = { ...Object.fromEntries(Object.entries(TYPES).map(([m, e]) => [e, m])), m4a: 'audio/mp4', wav: 'audio/wav' };
export const MAX_AUDIO = 40 * 1024 * 1024;

/** The MIME type without parameters ("audio/webm;codecs=opus" → "audio/webm"). */
const base = (t: string) => t.split(';')[0].trim().toLowerCase();

/** Store an uploaded image and return the URL it is served from. */
export async function saveUpload(file: File): Promise<string> {
	return saveBytes(Buffer.from(await file.arrayBuffer()), file.type);
}

/** Store image or audio bytes and return the URL they are served from. */
export async function saveBytes(buf: Buffer, type: string): Promise<string> {
	const t = base(type);
	const ext = TYPES[t];
	if (!ext) throw new Error('Only images and audio can be uploaded.');
	const audio = t.startsWith('audio/');
	if (buf.length > (audio ? MAX_AUDIO : MAX_UPLOAD)) throw new Error(audio ? 'Recordings must be 40 MB or smaller.' : 'Images must be 15 MB or smaller.');
	const name = `${uid()}.${ext}`;
	await writeFile(join(UPLOAD_DIR, name), buf);
	return `/uploads/${name}`;
}

export async function readUpload(name: string) {
	const safe = basename(name);
	const ext = safe.split('.').pop() ?? '';
	const type = MIME[ext];
	if (!type) return null;
	try {
		return { body: await readFile(join(UPLOAD_DIR, safe)), type };
	} catch {
		return null;
	}
}
