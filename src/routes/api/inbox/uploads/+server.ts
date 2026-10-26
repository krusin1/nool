import { error } from '@sveltejs/kit';
import { requireToken } from '#lib/server/inbox.ts';
import { saveUpload } from '#lib/server/uploads.ts';
import { ok } from '#lib/server/http.ts';
import type { RequestHandler } from './$types';

/** Upload an image from another app. Returns { src } to use in an image block. */
export const POST: RequestHandler = async ({ request }) => {
	requireToken(request);
	const file = (await request.formData()).get('file');
	if (!(file instanceof File)) error(400, 'Send the image as a "file" form field.');
	try {
		return ok({ src: await saveUpload(file) }, 201);
	} catch (e) {
		error(400, (e as Error).message);
	}
};
