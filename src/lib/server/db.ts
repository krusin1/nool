import { DatabaseSync, type SQLInputValue } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

// Local data lives in ./data (database and uploaded files). Override with NOOL_DATA_DIR.
export const DATA_DIR = process.env.NOOL_DATA_DIR ?? join(process.cwd(), 'data');
export const UPLOAD_DIR = join(DATA_DIR, 'uploads');

mkdirSync(UPLOAD_DIR, { recursive: true });

// Node's built-in SQLite: no native modules to install or bundle.
export const db = new DatabaseSync(join(DATA_DIR, 'nool.db'));
db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');

db.exec(`
	CREATE TABLE IF NOT EXISTS projects (
		id TEXT PRIMARY KEY,
		title TEXT NOT NULL,
		description TEXT NOT NULL DEFAULT '',
		created_at TEXT NOT NULL,
		updated_at TEXT NOT NULL,
		posted_at TEXT
	);

	CREATE TABLE IF NOT EXISTS stages (
		id TEXT PRIMARY KEY,
		project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
		name TEXT NOT NULL,
		position INTEGER NOT NULL
	);

	CREATE TABLE IF NOT EXISTS blocks (
		id TEXT PRIMARY KEY,
		project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
		stage_id TEXT NOT NULL REFERENCES stages(id) ON DELETE CASCADE,
		type TEXT NOT NULL,
		data TEXT NOT NULL,
		position INTEGER NOT NULL,
		source TEXT NOT NULL DEFAULT 'desk',
		created_at TEXT NOT NULL,
		updated_at TEXT NOT NULL
	);

	CREATE TABLE IF NOT EXISTS precedents (
		id TEXT PRIMARY KEY,
		project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
		stage_id TEXT NOT NULL REFERENCES stages(id) ON DELETE CASCADE,
		source TEXT NOT NULL,
		title TEXT NOT NULL,
		creator TEXT NOT NULL DEFAULT '',
		year TEXT NOT NULL DEFAULT '',
		url TEXT NOT NULL DEFAULT '',
		image_url TEXT,
		snippet TEXT NOT NULL DEFAULT '',
		kept INTEGER NOT NULL DEFAULT 0,
		note TEXT NOT NULL DEFAULT '',
		created_at TEXT NOT NULL
	);

	CREATE TABLE IF NOT EXISTS settings (
		key TEXT PRIMARY KEY,
		value TEXT NOT NULL
	);

	CREATE INDEX IF NOT EXISTS stages_project ON stages(project_id, position);
	CREATE INDEX IF NOT EXISTS blocks_stage ON blocks(stage_id, position);
	CREATE INDEX IF NOT EXISTS precedents_stage ON precedents(stage_id);
`);

export const now = () => new Date().toISOString();
export const uid = () => crypto.randomUUID();

/** Run `fn` inside a transaction; roll back if it throws. */
export function tx<T>(fn: () => T): T {
	db.exec('BEGIN');
	try {
		const result = fn();
		db.exec('COMMIT');
		return result;
	} catch (e) {
		db.exec('ROLLBACK');
		throw e;
	}
}

/** Rewrite positions 0..n in the given order. */
export function reorder(table: 'stages' | 'blocks', ids: string[]) {
	const stmt = db.prepare(`UPDATE ${table} SET position = ? WHERE id = ?`);
	tx(() => ids.forEach((id, i) => stmt.run(i, id)));
}

/** Bind a typed row object as named parameters. */
export const params = (row: object) => row as Record<string, SQLInputValue>;

/** Typed reads. */
export const all = <T>(sql: string, ...args: SQLInputValue[]) => db.prepare(sql).all(...args) as unknown as T[];
export const get = <T>(sql: string, ...args: SQLInputValue[]) => db.prepare(sql).get(...args) as unknown as T | undefined;
