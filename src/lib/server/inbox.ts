import { error } from '@sveltejs/kit';
import { db } from './db.ts';
import { checkToken } from './repo/settings.ts';
import { listStages } from './repo/stages.ts';
import type { Project, Stage } from '#lib/types.ts';

/** Inbox routes are called by other apps, so they need the token from the Connections page. */
export function requireToken(request: Request) {
	if (!checkToken(request.headers.get('authorization'))) {
		error(401, 'Missing or wrong token. Copy it from Nool → Connections.');
	}
}

const norm = (s: string) => s.trim().toLowerCase();

/** Find a project by id or title (case-insensitive). */
export function resolveProject(ref: string): Project {
	const all = db.prepare('SELECT * FROM projects ORDER BY updated_at DESC').all() as Project[];
	const p = all.find((x) => x.id === ref) ?? all.find((x) => norm(x.title) === norm(ref));
	if (!p) error(404, `No project matches "${ref}". Projects: ${all.map((x) => x.title).join(', ')}`);
	return p;
}

/**
 * Find a stage by id or name. Without one, use the stage the maker touched last,
 * so incoming work lands where they are working.
 */
export function resolveStage(project: Project, ref?: string): Stage {
	const stages = listStages(project.id);
	if (ref) {
		const s = stages.find((x) => x.id === ref) ?? stages.find((x) => norm(x.name) === norm(ref));
		if (!s) error(404, `No stage matches "${ref}". Stages: ${stages.map((x) => x.name).join(', ')}`);
		return s;
	}
	const recent = db
		.prepare('SELECT stage_id FROM blocks WHERE project_id = ? ORDER BY updated_at DESC LIMIT 1')
		.get(project.id) as { stage_id: string } | undefined;
	return stages.find((s) => s.id === recent?.stage_id) ?? stages[0];
}
