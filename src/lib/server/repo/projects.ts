import { all, db, now, params, tx, uid } from '../db.ts';
import { TEMPLATES } from '#lib/templates.ts';
import { emptyData } from '#lib/blocks.ts';
import { addBlock, listBlocks } from './blocks.ts';
import { coverOf } from '#lib/stamp.ts';
import { listStages } from './stages.ts';
import { listPrecedents } from './precedents.ts';
import type { Project, ProjectSummary } from '#lib/types.ts';

export function getProject(id: string): Project | undefined {
	return db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as Project | undefined;
}

export function listSummaries(): ProjectSummary[] {
	const projects = all<Project>('SELECT * FROM projects ORDER BY updated_at DESC');
	const counts = db.prepare(
		`SELECT
			(SELECT COUNT(*) FROM blocks WHERE project_id = @id) AS blockCount,
			(SELECT COUNT(*) FROM stages WHERE project_id = @id) AS stageCount,
			(SELECT COUNT(DISTINCT stage_id) FROM blocks WHERE project_id = @id) AS filledStages`
	);
	return projects.map((project) => ({
		project,
		...(counts.get({ id: project.id }) as Omit<ProjectSummary, 'project' | 'cover'>),
		cover: coverOf(listBlocks(project.id))
	}));
}

/** Everything the desk and the letter page need, in one read. */
export function loadProject(id: string) {
	const project = getProject(id);
	if (!project) return null;
	return { project, stages: listStages(id), blocks: listBlocks(id), precedents: listPrecedents(id) };
}

export function createProject(input: { title: string; description?: string; template?: string }): Project {
	const template = TEMPLATES.find((t) => t.id === input.template) ?? TEMPLATES[0];
	const t = now();
	const project: Project = {
		id: uid(),
		title: input.title.trim() || 'Untitled',
		description: (input.description ?? '').trim(),
		created_at: t,
		updated_at: t,
		posted_at: null
	};
	tx(() => {
		db.prepare(
			'INSERT INTO projects (id, title, description, created_at, updated_at, posted_at) VALUES (@id, @title, @description, @created_at, @updated_at, @posted_at)'
		).run(params(project));
		const insertStage = db.prepare('INSERT INTO stages (id, project_id, name, position) VALUES (?, ?, ?, ?)');
		template.stages.forEach((s, i) => {
			const stageId = uid();
			insertStage.run(stageId, project.id, s.name, i);
			if (s.starter) addBlock({ project_id: project.id, stage_id: stageId, type: s.starter, data: emptyData(s.starter) });
		});
	});
	return project;
}

export function updateProject(id: string, patch: Partial<Pick<Project, 'title' | 'description'>>) {
	const current = getProject(id);
	if (!current) return null;
	const next = { ...current, ...patch, updated_at: now() };
	db.prepare('UPDATE projects SET title = @title, description = @description, updated_at = @updated_at WHERE id = @id').run(next);
	return next;
}

export function setPosted(id: string, posted: boolean) {
	const t = now();
	db.prepare('UPDATE projects SET posted_at = ?, updated_at = ? WHERE id = ?').run(posted ? t : null, t, id);
	return getProject(id);
}

export function deleteProject(id: string) {
	db.prepare('DELETE FROM projects WHERE id = ?').run(id);
}

export function touchProject(id: string) {
	db.prepare('UPDATE projects SET updated_at = ? WHERE id = ?').run(now(), id);
}
