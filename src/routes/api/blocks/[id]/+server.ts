import { deleteBlock, getBlock, updateBlockData } from '#lib/server/repo/blocks.ts';
import { blockData } from '#lib/server/validate.ts';
import { body, found, ok } from '#lib/server/http.ts';
import type { RequestHandler } from './$types';

export const PATCH: RequestHandler = async ({ params, request }) => {
	const block = found(getBlock(params.id));
	const b = await body(request);
	return ok(updateBlockData(block.id, blockData(block.type, b.data)));
};

export const DELETE: RequestHandler = ({ params }) => {
	deleteBlock(params.id);
	return ok();
};
