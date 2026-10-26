import { error } from '@sveltejs/kit';
import { backupName, createBackup, restoreBackup } from '#lib/server/backup.ts';
import { ok } from '#lib/server/http.ts';
import type { RequestHandler } from './$types';

/** Download a backup file of everything. */
export const GET: RequestHandler = () =>
	new Response(new Uint8Array(createBackup()), {
		headers: {
			'content-type': 'application/gzip',
			'content-disposition': `attachment; filename="${backupName()}"`
		}
	});

/** Restore from an uploaded backup file (form field "file"). Replaces all projects. */
export const POST: RequestHandler = async ({ request }) => {
	const file = (await request.formData()).get('file');
	if (!(file instanceof File)) error(400, 'Choose a backup file.');
	try {
		return ok(restoreBackup(Buffer.from(await file.arrayBuffer())));
	} catch (e) {
		error(400, (e as Error).message);
	}
};
