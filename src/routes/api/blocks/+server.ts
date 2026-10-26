import { addBlock } from '#lib/server/repo/blocks.ts';
import { getStage } from '#lib/server/repo/stages.ts';
import { blockData, blockType } from '#lib/server/validate.ts';
import { body, found, ok, str } from '#lib/server/http.ts';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const b = await body(request);
	const stage = found(getStage(str(b.stage_id)), 'Stage not found');
	const type = blockType(b.type);
	return ok(addBlock({ project_id: stage.project_id, stage_id: stage.id, type, data: blockData(type, b.data) }), 201);
};
