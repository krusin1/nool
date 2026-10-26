import { error } from '@sveltejs/kit';
import { saveUpload } from '#lib/server/uploads.ts';
import { ok } from '#lib/server/http.ts';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const file = (await request.formData()).get('file');
	if (!(file instanceof File)) error(400, 'Send the image as a "file" form field.');
	try {
		return ok({ src: await saveUpload(file) }, 201);
	} catch (e) {
		error(400, (e as Error).message);
	}
};
