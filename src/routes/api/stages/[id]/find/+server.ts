import { error } from '@sveltejs/kit';
import { findPrecedents } from '#lib/server/assist.ts';
import { ok } from '#lib/server/http.ts';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params }) => {
	try {
		return ok(await findPrecedents(params.id));
	} catch (e) {
		error(400, (e as Error).message);
	}
};
