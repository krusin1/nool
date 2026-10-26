import { error } from '@sveltejs/kit';
import { searchSources } from '#lib/server/assist.ts';
import { requireToken, resolveProject, resolveStage } from '#lib/server/inbox.ts';
import { body, ok, str } from '#lib/server/http.ts';
import type { RequestHandler } from './$types';

/** Search The Met, Cooper Hewitt, Semantic Scholar, arXiv and GitHub. */
export const POST: RequestHandler = async ({ request }) => {
	requireToken(request);
	const b = await body(request);
	const project = resolveProject(str(b.project));
	const stage = resolveStage(project, str(b.stage) || undefined);
	const queries = (Array.isArray(b.queries) ? b.queries : []).filter((q): q is string => typeof q === 'string' && !!q.trim()).slice(0, 6);
	if (!queries.length) error(400, 'Give 1 to 6 search queries.');
	const { pool, failed } = await searchSources(queries, stage.id);
	return ok({ results: pool.slice(0, 40), failed });
};
