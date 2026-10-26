import { error } from '@sveltejs/kit';
import { requireToken } from '#lib/server/inbox.ts';
import { MAX_UPLOAD, saveUpload } from '#lib/server/uploads.ts';
import { ok } from '#lib/server/http.ts';
import type { RequestHandler } from './$types';

/**
 * Upload an image from another app. Returns { src } to use in an image block.
 * Send either a multipart "file" field, or JSON { name, type, base64 } (used by the Figma plugin).
 */
export const POST: RequestHandler = async ({ request }) => {
	requireToken(request);
	let file: File;
	if (request.headers.get('content-type')?.includes('application/json')) {
		const b = await request.json().catch(() => ({}));
		if (typeof b.base64 !== 'string' || typeof b.type !== 'string') error(400, 'Send { name, type, base64 }.');
		if (b.base64.length > (MAX_UPLOAD * 4) / 3 + 4) error(400, 'Images must be 15 MB or smaller.');
		file = new File([Buffer.from(b.base64, 'base64')], typeof b.name === 'string' ? b.name : 'image', { type: b.type });
	} else {
		const field = (await request.formData()).get('file');
		if (!(field instanceof File)) error(400, 'Send the image as a "file" form field.');
		file = field;
	}
	try {
		return ok({ src: await saveUpload(file) }, 201);
	} catch (e) {
		error(400, (e as Error).message);
	}
};
