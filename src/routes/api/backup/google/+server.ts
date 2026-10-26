import { error } from '@sveltejs/kit';
import { authUrl, backupToDrive, disconnect, driveStatus, listBackups, setAuto } from '#lib/server/gdrive.ts';
import { openExternal } from '#lib/server/open.ts';
import { body, ok } from '#lib/server/http.ts';
import type { RequestHandler } from './$types';

const fail = (e: unknown) => error(400, (e as Error).message);

/** Connection status and the list of backups in Drive. */
export const GET: RequestHandler = async () => {
	const status = driveStatus();
	const backups = status.connected ? await listBackups().catch(() => []) : [];
	return ok({ ...status, backups });
};

/**
 * { action: 'connect' } starts sign-in in the system browser (returns the URL too).
 * { action: 'backup' } backs up now. { action: 'auto', on } toggles the daily backup.
 */
export const POST: RequestHandler = async ({ request, url }) => {
	const b = await body(request);
	try {
		if (b.action === 'connect') {
			const href = authUrl(url.origin);
			const opened = await openExternal(href);
			return ok({ url: href, opened });
		}
		if (b.action === 'backup') return ok(await backupToDrive());
		if (b.action === 'auto') {
			setAuto(b.on === true);
			return ok(driveStatus());
		}
	} catch (e) {
		fail(e);
	}
	error(400, 'Unknown action');
};

export const DELETE: RequestHandler = async () => {
	await disconnect();
	return ok();
};
