import { addBlock } from '#lib/server/repo/blocks.ts';
import { requireToken, resolveProject, resolveStage } from '#lib/server/inbox.ts';
import { blockData, blockType } from '#lib/server/validate.ts';
import { body, ok, str } from '#lib/server/http.ts';
import type { RequestHandler } from './$types';

/**
 * Add a block from another app.
 * Body: { project, stage?, type, data, source? }
 * project and stage accept an id or a name. source names the sending app ("Figma", "Blender").
 */
export const POST: RequestHandler = async ({ request, url }) => {
	requireToken(request);
	const b = await body(request);
	const project = resolveProject(str(b.project));
	const stage = resolveStage(project, str(b.stage) || undefined);
	const type = blockType(b.type);
	const block = addBlock({
		project_id: project.id,
		stage_id: stage.id,
		type,
		data: blockData(type, b.data),
		source: str(b.source).trim().slice(0, 40) || 'another app'
	});
	return ok({ block, stage: stage.name, project: project.title, desk: `${url.origin}/p/${project.id}` }, 201);
};
