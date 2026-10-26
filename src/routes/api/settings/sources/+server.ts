import { deleteSetting, setSetting } from '#lib/server/repo/settings.ts';
import { body, ok, str } from '#lib/server/http.ts';
import type { RequestHandler } from './$types';

/** Optional keys for precedent sources. Only Cooper Hewitt needs one. */
export const PUT: RequestHandler = async ({ request }) => {
	const key = str((await body(request)).cooperhewitt).trim().slice(0, 200);
	if (key) setSetting('cooperhewitt_key', key);
	else deleteSetting('cooperhewitt_key');
	return ok({ cooperhewitt: !!key });
};
