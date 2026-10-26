import { deleteSetting, setSetting } from '#lib/server/repo/settings.ts';
import { ok } from '#lib/server/http.ts';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = () => {
	setSetting('welcomed', new Date().toISOString());
	return ok();
};

/** Show the welcome steps again next time. */
export const DELETE: RequestHandler = () => {
	deleteSetting('welcomed');
	return ok();
};
