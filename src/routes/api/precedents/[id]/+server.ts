import { deletePrecedent, updatePrecedent } from '#lib/server/repo/precedents.ts';
import { body, found, ok } from '#lib/server/http.ts';
import type { RequestHandler } from './$types';

export const PATCH: RequestHandler = async ({ params, request }) => {
	const b = await body(request);
	const patch: { kept?: boolean; note?: string } = {};
	if (typeof b.kept === 'boolean') patch.kept = b.kept;
	if (typeof b.note === 'string') patch.note = b.note.slice(0, 2000);
	return ok(found(updatePrecedent(params.id, patch)));
};

export const DELETE: RequestHandler = ({ params }) => {
	deletePrecedent(params.id);
	return ok();
};
