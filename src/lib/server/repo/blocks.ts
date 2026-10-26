import { db, now, reorder, tx, uid } from '../db.ts';
import { touchProject } from './projects.ts';
import type { Block, BlockDataMap, BlockType } from '#lib/types.ts';

type Row = Omit<Block, 'data'> & { data: string };

const parse = (row: Row): Block => ({ ...row, data: JSON.parse(row.data) }) as Block;

export function listBlocks(projectId: string): Block[] {
	const rows = db
		.prepare(
			`SELECT b.* FROM blocks b JOIN stages s ON s.id = b.stage_id
			 WHERE b.project_id = ? ORDER BY s.position, b.position`
		)
		.all(projectId) as Row[];
	return rows.map(parse);
}

export function getBlock(id: string): Block | undefined {
	const row = db.prepare('SELECT * FROM blocks WHERE id = ?').get(id) as Row | undefined;
	return row && parse(row);
}

export function addBlock<T extends BlockType>(input: {
	project_id: string;
	stage_id: string;
	type: T;
	data: BlockDataMap[T];
	source?: string;
}): Block {
	const { n } = db.prepare('SELECT COUNT(*) AS n FROM blocks WHERE stage_id = ?').get(input.stage_id) as { n: number };
	const t = now();
	const row = {
		id: uid(),
		project_id: input.project_id,
		stage_id: input.stage_id,
		type: input.type,
		data: JSON.stringify(input.data),
		position: n,
		source: input.source ?? 'desk',
		created_at: t,
		updated_at: t
	};
	db.prepare(
		`INSERT INTO blocks (id, project_id, stage_id, type, data, position, source, created_at, updated_at)
		 VALUES (@id, @project_id, @stage_id, @type, @data, @position, @source, @created_at, @updated_at)`
	).run(row);
	touchProject(input.project_id);
	return parse(row as Row);
}

export function updateBlockData(id: string, data: unknown) {
	const block = getBlock(id);
	if (!block) return null;
	db.prepare('UPDATE blocks SET data = ?, updated_at = ? WHERE id = ?').run(JSON.stringify(data), now(), id);
	touchProject(block.project_id);
	return getBlock(id);
}

export function deleteBlock(id: string) {
	const block = getBlock(id);
	if (!block) return;
	db.prepare('DELETE FROM blocks WHERE id = ?').run(id);
	touchProject(block.project_id);
}

/** Set the full order of a stage's blocks (also used to move a block into a stage). */
export function reorderBlocks(stageId: string, ids: string[]) {
	const move = db.prepare('UPDATE blocks SET stage_id = ? WHERE id = ?');
	tx(() => ids.forEach((id) => move.run(stageId, id)));
	reorder('blocks', ids);
}

