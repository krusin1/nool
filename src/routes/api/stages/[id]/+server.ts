import { error } from '@sveltejs/kit';
import { deleteStage, renameStage } from '#lib/server/repo/stages.ts';
import { body, found, ok, str } from '#lib/server/http.ts';
import type { RequestHandler } from './$types';

export const PATCH: RequestHandler = async ({ params, request }) => {
	const b = await body(request);
	return ok(found(renameStage(params.id, str(b.name).slice(0, 80))));
};

export const DELETE: RequestHandler = ({ params }) => {
	if (!deleteStage(params.id)) error(400, 'A project needs at least one stage.');
	return ok();
};
