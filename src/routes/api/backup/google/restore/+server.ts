import { error } from '@sveltejs/kit';
import { restoreFromDrive } from '#lib/server/gdrive.ts';
import { body, ok, str } from '#lib/server/http.ts';
import type { RequestHandler } from './$types';

/** Body: { id } of a Drive backup. Replaces all projects. */
export const POST: RequestHandler = async ({ request }) => {
	const id = str((await body(request)).id);
	if (!id) error(400, 'Choose a backup.');
	try {
		return ok(await restoreFromDrive(id));
	} catch (e) {
		error(400, (e as Error).message);
	}
};
