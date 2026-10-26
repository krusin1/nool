import { db, now, uid } from '../db.ts';
import type { Precedent } from '#lib/types.ts';

type Row = Omit<Precedent, 'kept'> & { kept: number };
const parse = (r: Row): Precedent => ({ ...r, kept: !!r.kept });

export function listPrecedents(projectId: string): Precedent[] {
	return (db.prepare('SELECT * FROM precedents WHERE project_id = ? ORDER BY created_at').all(projectId) as Row[]).map(parse);
}

export function addPrecedent(input: Omit<Precedent, 'id' | 'created_at'>): Precedent {
	const p: Precedent = { ...input, id: uid(), created_at: now() };
	db.prepare(
		`INSERT INTO precedents (id, project_id, stage_id, source, title, creator, year, url, image_url, snippet, kept, note, created_at)
		 VALUES (@id, @project_id, @stage_id, @source, @title, @creator, @year, @url, @image_url, @snippet, @kept, @note, @created_at)`
	).run({ ...p, kept: p.kept ? 1 : 0 });
	return p;
}

export function updatePrecedent(id: string, patch: { kept?: boolean; note?: string }) {
	const row = db.prepare('SELECT * FROM precedents WHERE id = ?').get(id) as Row | undefined;
	if (!row) return null;
	const next = { ...parse(row), ...patch };
	db.prepare('UPDATE precedents SET kept = ?, note = ? WHERE id = ?').run(next.kept ? 1 : 0, next.note, id);
	return next;
}

export function deletePrecedent(id: string) {
	db.prepare('DELETE FROM precedents WHERE id = ?').run(id);
}
