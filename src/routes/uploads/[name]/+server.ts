import { error } from '@sveltejs/kit';
import { readUpload } from '#lib/server/uploads.ts';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, request }) => {
	const file = await readUpload(params.name);
	if (!file) error(404, 'File not found');
	const headers: Record<string, string> = {
		'content-type': file.type,
		'accept-ranges': 'bytes',
		'cache-control': 'public, max-age=31536000, immutable',
		// Uploaded SVGs are shown as images only, never run as documents.
		'content-security-policy': "default-src 'none'; style-src 'unsafe-inline'; sandbox"
	};
	// Audio players (Safari and the macOS app especially) ask for byte ranges.
	const range = request.headers.get('range')?.match(/^bytes=(\d*)-(\d*)$/);
	const size = file.body.length;
	if (range && (range[1] || range[2])) {
		let start = range[1] ? Number(range[1]) : size - Number(range[2]);
		let end = range[1] && range[2] ? Number(range[2]) : size - 1;
		start = Math.max(0, start);
		end = Math.min(end, size - 1);
		if (start > end) return new Response(null, { status: 416, headers: { 'content-range': `bytes */${size}` } });
		return new Response(new Uint8Array(file.body.subarray(start, end + 1)), {
			status: 206,
			headers: { ...headers, 'content-range': `bytes ${start}-${end}/${size}`, 'content-length': String(end - start + 1) }
		});
	}
	return new Response(new Uint8Array(file.body), { headers: { ...headers, 'content-length': String(size) } });
};
