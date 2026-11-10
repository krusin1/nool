// Browser preview: answers the app's own /api requests inside the page, using the same
// handlers as the desktop server. Anything that needs the desktop app gets a plain message.
import { isHttpError } from '@sveltejs/kit';

type Handler = (event: { request: Request; params: Record<string, string>; url: URL; fetch: typeof fetch }) => Response | Promise<Response>;
type Mod = Partial<Record<'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE', Handler>>;

const modules = import.meta.glob<Mod>(
	[
		'/src/routes/api/projects/**/+server.ts',
		'/src/routes/api/stages/**/+server.ts',
		'/src/routes/api/blocks/**/+server.ts',
		'/src/routes/api/precedents/**/+server.ts',
		'/src/routes/api/uploads/+server.ts',
		'/src/routes/api/settings/welcomed/+server.ts',
		'!**/export/**',
		'!**/summary/**',
		'!**/find/**',
		'!**/transcribe/**'
	],
	{ eager: true }
);

const routes = Object.entries(modules).map(([file, mod]) => {
	const path = file.replace('/src/routes', '').replace('/+server.ts', '');
	const names: string[] = [];
	const re = new RegExp('^' + path.replace(/\[(\w+)\]/g, (_, n) => (names.push(n), '([^/]+)')) + '$');
	return { re, names, mod };
});

const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
const DESKTOP = 'That works in the desktop app. Download Nool to use it.';

export async function handle(request: Request): Promise<Response> {
	const url = new URL(request.url);
	for (const r of routes) {
		const m = url.pathname.match(r.re);
		if (!m) continue;
		const fn = r.mod[request.method as keyof Mod];
		if (!fn) return json(405, { message: 'Method not allowed' });
		const params = Object.fromEntries(r.names.map((n, i) => [n, decodeURIComponent(m[i + 1])]));
		try {
			return await fn({ request, params, url, fetch: window.fetch });
		} catch (e) {
			if (isHttpError(e)) return json(e.status, e.body);
			return json(400, { message: (e as Error).message ?? 'Something went wrong' });
		}
	}
	return json(400, { message: DESKTOP });
}

/** Send same-origin /api calls to the handlers above instead of the network. */
export function install() {
	const real = window.fetch.bind(window);
	window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
		const req = new Request(input, init);
		const u = new URL(req.url);
		if (u.origin === location.origin && u.pathname.startsWith('/api/')) return handle(req);
		return real(input, init);
	};
}
