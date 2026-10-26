import { finishAuth } from '#lib/server/gdrive.ts';
import type { RequestHandler } from './$types';

// Google redirects the browser here after sign-in. Show a plain page the user can close.
const page = (title: string, text: string) =>
	new Response(
		`<!doctype html><meta charset="utf-8"><title>${title}</title><body style="font:16px/1.5 system-ui;max-width:480px;margin:15vh auto;padding:0 24px;color:#111;background:#fafaf8"><h1 style="font-size:24px">${title}</h1><p>${text}</p></body>`,
		{ headers: { 'content-type': 'text/html; charset=utf-8' } }
	);

const esc = (s: string) => s.replace(/[<>&"]/g, (c) => `&#${c.charCodeAt(0)};`);

export const GET: RequestHandler = async ({ url }) => {
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	if (!code || !state) return page('Not connected', esc(url.searchParams.get('error') ?? 'Sign-in was cancelled.'));
	try {
		await finishAuth(state, code);
		return page('Google Drive connected', 'You can close this tab and go back to Nool.');
	} catch (e) {
		return page('Not connected', esc((e as Error).message));
	}
};
