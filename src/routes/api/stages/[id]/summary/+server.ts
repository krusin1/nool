import { error } from '@sveltejs/kit';
import { summarizeStage } from '#lib/server/assist.ts';
import { ok } from '#lib/server/http.ts';
import type { RequestHandler } from './$types';

/** Runs only when the maker asks. Returns text; nothing is saved unless they add it. */
export const POST: RequestHandler = async ({ params }) => {
	try {
		return ok({ text: await summarizeStage(params.id) });
	} catch (e) {
		error(400, (e as Error).message);
	}
};
