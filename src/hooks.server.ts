import { error } from '@sveltejs/kit';
import type { Handle, ServerInit } from '@sveltejs/kit/hooks';
import { seedIfEmpty } from '#lib/server/seed.ts';

export const init: ServerInit = () => {
	seedIfEmpty();
};

const SAFE = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * The desk API is for this app only: reject writes from other origins so a web page
 * open in another tab can't change your projects. The inbox API uses a token instead.
 */
// The inbox is called from other apps, including Figma plugins (whose origin is "null").
// It is token-protected, so any origin may call it.
const CORS = {
	'access-control-allow-origin': '*',
	'access-control-allow-methods': 'GET, POST, OPTIONS',
	'access-control-allow-headers': 'authorization, content-type',
	'access-control-max-age': '86400'
};

export const handle: Handle = async ({ event, resolve }) => {
	const { pathname, origin } = event.url;
	if (pathname.startsWith('/api/inbox')) {
		if (event.request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
		const res = await resolve(event);
		for (const [k, v] of Object.entries(CORS)) res.headers.set(k, v);
		return res;
	}
	if (pathname.startsWith('/api/') && !pathname.startsWith('/api/inbox') && !SAFE.has(event.request.method)) {
		const from = event.request.headers.get('origin');
		if (from && from !== origin) error(403, 'Cross-origin requests are not allowed');
	}
	return resolve(event);
};
