import { addPrecedent } from '#lib/server/repo/precedents.ts';
import { getStage } from '#lib/server/repo/stages.ts';
import { body, found, ok, str } from '#lib/server/http.ts';
import type { RequestHandler } from './$types';

/** A precedent the maker adds by hand. It is kept straight away. */
export const POST: RequestHandler = async ({ request }) => {
	const b = await body(request);
	const stage = found(getStage(str(b.stage_id)), 'Stage not found');
	return ok(
		addPrecedent({
			project_id: stage.project_id,
			stage_id: stage.id,
			source: 'web',
			title: str(b.title).trim().slice(0, 300) || 'Untitled',
			creator: str(b.creator).slice(0, 300),
			year: str(b.year).slice(0, 40),
			url: str(b.url).slice(0, 2000),
			image_url: null,
			snippet: '',
			kept: true,
			note: str(b.note).slice(0, 2000)
		}),
		201
	);
};
