import { context } from '#lib/server/assist.ts';
import { requireToken, resolveProject, resolveStage } from '#lib/server/inbox.ts';
import { listPrecedents } from '#lib/server/repo/precedents.ts';
import { ok } from '#lib/server/http.ts';
import type { RequestHandler } from './$types';

/** Read one stage's notes, so an AI app can summarize it or look for precedents. */
export const GET: RequestHandler = ({ request, url }) => {
	requireToken(request);
	const project = resolveProject(url.searchParams.get('project') ?? '');
	const stage = resolveStage(project, url.searchParams.get('stage') ?? undefined);
	const { text } = context(stage.id);
	const kept = listPrecedents(project.id).filter((p) => p.stage_id === stage.id && p.kept);
	return ok({
		project: project.title,
		description: project.description,
		stage: stage.name,
		notes: text,
		kept: kept.map((p) => `${p.title}${p.creator ? `, ${p.creator}` : ''}`)
	});
};
