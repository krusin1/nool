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
	'image/avif': 'avif'
};

const MIME = Object.fromEntries(Object.entries(TYPES).map(([m, e]) => [e, m]));

/** Store an uploaded image and return the URL it is served from. */
export async function saveUpload(file: File): Promise<string> {
	const ext = TYPES[file.type];
	if (!ext) throw new Error('Only images can be uploaded (PNG, JPEG, GIF, WebP, SVG, AVIF).');
	if (file.size > MAX_UPLOAD) throw new Error('Images must be 15 MB or smaller.');
	const name = `${uid()}.${ext}`;
	await writeFile(join(UPLOAD_DIR, name), Buffer.from(await file.arrayBuffer()));
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
