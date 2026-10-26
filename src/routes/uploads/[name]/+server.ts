import { error } from '@sveltejs/kit';
import { readUpload } from '#lib/server/uploads.ts';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	const file = await readUpload(params.name);
	if (!file) error(404, 'Image not found');
	return new Response(new Uint8Array(file.body), {
		headers: {
			'content-type': file.type,
			'cache-control': 'public, max-age=31536000, immutable',
			// Uploaded SVGs are shown as images only, never run as documents.
			'content-security-policy': "default-src 'none'; style-src 'unsafe-inline'; sandbox"
		}
	});
};
