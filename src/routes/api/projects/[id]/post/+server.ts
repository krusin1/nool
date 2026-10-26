import { setPosted } from '#lib/server/repo/projects.ts';
import { found, ok } from '#lib/server/http.ts';
import type { RequestHandler } from './$types';

/** Post the project as a case study. */
export const POST: RequestHandler = ({ params }) => ok(found(setPosted(params.id, true)));

/** Recall it: back to mint. */
export const DELETE: RequestHandler = ({ params }) => ok(found(setPosted(params.id, false)));
