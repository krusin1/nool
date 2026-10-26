import { ok } from '#lib/server/http.ts';
import type { RequestHandler } from './$types';

/** Lets the desktop shell check that the local server is Nool and ready. */
export const GET: RequestHandler = () => ok({ app: 'nool', ok: true });
