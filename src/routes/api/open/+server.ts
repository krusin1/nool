import { error } from '@sveltejs/kit';
import { openExternal } from '#lib/server/open.ts';
import { body, ok, str } from '#lib/server/http.ts';
import type { RequestHandler } from './$types';

/** Open a web link in the system browser, or the Claude app (used by the desktop app). */
export const POST: RequestHandler = async ({ request }) => {
	const url = str((await body(request)).url);
	if (!/^(https?:\/\/|claude:\/\/)/i.test(url)) error(400, 'Only web links can be opened.');
	return ok({ opened: await openExternal(url) });
};
