import { db } from '#lib/server/db.ts';
import { requireToken } from '#lib/server/inbox.ts';
import { listStages } from '#lib/server/repo/stages.ts';
import { ok } from '#lib/server/http.ts';
import type { Project } from '#lib/types.ts';
import type { RequestHandler } from './$types';

/** Projects and their stages, so a sending app can choose where work goes. */
export const GET: RequestHandler = ({ request }) => {
	requireToken(request);
	const projects = db.prepare('SELECT * FROM projects ORDER BY updated_at DESC').all() as Project[];
	return ok(
		projects.map((p) => ({
			id: p.id,
			title: p.title,
			posted: !!p.posted_at,
			stages: listStages(p.id).map((s) => ({ id: s.id, name: s.name }))
		}))
	);
};
