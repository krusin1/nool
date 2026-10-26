import { rotateInboxToken } from '#lib/server/repo/settings.ts';
import { ok } from '#lib/server/http.ts';
import type { RequestHandler } from './$types';

/** Issue a new inbox token. Apps using the old one stop working. */
export const POST: RequestHandler = () => ok({ token: rotateInboxToken() });
