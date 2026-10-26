import { getStage } from '#lib/server/repo/stages.ts';
import { reorderBlocks } from '#lib/server/repo/blocks.ts';
import { body, found, ok } from '#lib/server/http.ts';
import type { RequestHandler } from './$types';

/** Body: { ids: string[] }, the stage's blocks in their new order. */
export const PUT: RequestHandler = async ({ params, request }) => {
	found(getStage(params.id));
	const b = await body<{ ids?: unknown }>(request);
	reorderBlocks(params.id, Array.isArray(b.ids) ? b.ids.filter((x): x is string => typeof x === 'string') : []);
	return ok();
};
