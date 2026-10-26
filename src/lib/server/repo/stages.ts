import { db, reorder, uid } from '../db.ts';
import { touchProject } from './projects.ts';
import type { Stage } from '#lib/types.ts';

export function listStages(projectId: string): Stage[] {
	return db.prepare('SELECT * FROM stages WHERE project_id = ? ORDER BY position').all(projectId) as Stage[];
}

export function getStage(id: string): Stage | undefined {
	return db.prepare('SELECT * FROM stages WHERE id = ?').get(id) as Stage | undefined;
}

export function addStage(projectId: string, name: string): Stage {
	const { n } = db.prepare('SELECT COUNT(*) AS n FROM stages WHERE project_id = ?').get(projectId) as { n: number };
	const stage: Stage = { id: uid(), project_id: projectId, name: name.trim() || 'New stage', position: n };
	db.prepare('INSERT INTO stages (id, project_id, name, position) VALUES (@id, @project_id, @name, @position)').run(stage);
	touchProject(projectId);
	return stage;
}

export function renameStage(id: string, name: string) {
	const stage = getStage(id);
	if (!stage) return null;
	db.prepare('UPDATE stages SET name = ? WHERE id = ?').run(name.trim() || stage.name, id);
	touchProject(stage.project_id);
	return getStage(id);
}

/** Blocks and precedents in the stage are removed with it. A project keeps at least one stage. */
export function deleteStage(id: string): boolean {
	const stage = getStage(id);
	if (!stage) return false;
	const remaining = listStages(stage.project_id).filter((s) => s.id !== id);
	if (!remaining.length) return false;
	db.prepare('DELETE FROM stages WHERE id = ?').run(id);
	reorder('stages', remaining.map((s) => s.id));
	touchProject(stage.project_id);
	return true;
}

export function reorderStages(projectId: string, ids: string[]) {
	const own = new Set(listStages(projectId).map((s) => s.id));
	reorder('stages', ids.filter((id) => own.has(id)));
	touchProject(projectId);
}
