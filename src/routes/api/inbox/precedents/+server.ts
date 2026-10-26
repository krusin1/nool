import { error } from '@sveltejs/kit';
import { savePicks } from '#lib/server/assist.ts';
import { requireToken, resolveProject, resolveStage } from '#lib/server/inbox.ts';
import { body, ok, str } from '#lib/server/http.ts';
import type { SourceId } from '#lib/types.ts';
import type { RequestHandler } from './$types';

const SOURCES: SourceId[] = ['met', 'cooperhewitt', 'semanticscholar', 'arxiv', 'github', 'web'];

/** Suggest precedents for a stage. They replace earlier suggestions; the maker keeps the ones they want. */
export const POST: RequestHandler = async ({ request }) => {
	requireToken(request);
	const b = await body(request);
	const project = resolveProject(str(b.project));
	const stage = resolveStage(project, str(b.stage) || undefined);
	const items = (Array.isArray(b.items) ? b.items : []).slice(0, 12) as Record<string, unknown>[];
	const picks = items
		.filter((i) => str(i.title).trim() && /^https?:\/\//.test(str(i.url)))
		.map((i) => ({
			c: {
				source: (SOURCES.includes(str(i.source) as SourceId) ? str(i.source) : 'web') as SourceId,
				title: str(i.title).slice(0, 300),
				creator: str(i.creator).slice(0, 300),
				year: str(i.year).slice(0, 40),
				url: str(i.url).slice(0, 2000),
				image_url: /^https?:\/\//.test(str(i.image_url)) ? str(i.image_url).slice(0, 2000) : null,
				snippet: ''
			},
			why: str(i.why).slice(0, 300)
		}));
	if (!picks.length) error(400, 'Give at least one precedent with a title and a web link.');
	savePicks(stage, picks);
	return ok({ project: project.title, stage: stage.name, added: picks.length, desk: `${new URL(request.url).origin}/p/${project.id}` });
};
