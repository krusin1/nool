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
export const handle: Handle = ({ event, resolve }) => {
	const { pathname, origin } = event.url;
	if (pathname.startsWith('/api/') && !pathname.startsWith('/api/inbox') && !SAFE.has(event.request.method)) {
		const from = event.request.headers.get('origin');
		if (from && from !== origin) error(403, 'Cross-origin requests are not allowed');
	}
	return resolve(event);
};
