import { DatabaseSync, type SQLInputValue } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { SCHEMA } from './schema.ts';

// Local data lives in ./data (database and uploaded files). Override with NOOL_DATA_DIR.
export const DATA_DIR = process.env.NOOL_DATA_DIR ?? join(process.cwd(), 'data');
export const UPLOAD_DIR = join(DATA_DIR, 'uploads');

mkdirSync(UPLOAD_DIR, { recursive: true });

// Node's built-in SQLite: no native modules to install or bundle.
export const db = new DatabaseSync(join(DATA_DIR, 'nool.db'));
db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');

db.exec(SCHEMA);

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
