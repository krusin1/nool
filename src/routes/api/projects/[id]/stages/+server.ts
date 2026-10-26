import { addStage, reorderStages } from '#lib/server/repo/stages.ts';
import { getProject } from '#lib/server/repo/projects.ts';
import { body, found, ok, str } from '#lib/server/http.ts';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params, request }) => {
	found(getProject(params.id));
	const b = await body(request);
	return ok(addStage(params.id, str(b.name).slice(0, 80)), 201);
};

/** Body: { ids: string[] } in the new order. */
export const PUT: RequestHandler = async ({ params, request }) => {
	const b = await body<{ ids?: unknown }>(request);
	reorderStages(params.id, Array.isArray(b.ids) ? b.ids.filter((x): x is string => typeof x === 'string') : []);
	return ok();
};
