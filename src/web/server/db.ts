// Browser preview: the same database API as src/lib/server/db.ts, backed by SQLite compiled to
// WebAssembly (sql.js) and saved to this browser's IndexedDB. Nothing is sent to a server.
import initSqlJs, { type Database, type SqlValue } from 'sql.js';
import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url';
import { SCHEMA } from './schema.ts';

type Value = string | number | null | Uint8Array | bigint | boolean | undefined;

export const DATA_DIR = 'this browser';
export const UPLOAD_DIR = '';

const IDB = 'nool-preview', STORE = 'files', KEY = 'nool.db';
const idb = () =>
	new Promise<IDBDatabase>((resolve, reject) => {
		const r = indexedDB.open(IDB, 1);
		r.onupgradeneeded = () => r.result.createObjectStore(STORE);
		r.onsuccess = () => resolve(r.result);
		r.onerror = () => reject(r.error);
	});
async function loadBytes(): Promise<Uint8Array | null> {
	try {
		const d = await idb();
		return await new Promise((res) => {
			const q = d.transaction(STORE).objectStore(STORE).get(KEY);
			q.onsuccess = () => res((q.result as Uint8Array) ?? null);
			q.onerror = () => res(null);
		});
	} catch {
		return null;
	}
}
async function saveBytes(bytes: Uint8Array) {
	try {
		const d = await idb();
		d.transaction(STORE, 'readwrite').objectStore(STORE).put(bytes, KEY);
	} catch {
		/* private window: keep working in memory */
	}
}

const SQL = await initSqlJs({ locateFile: () => wasmUrl });
// "Start over" in the preview banner sets this flag before reloading.
let fresh = false;
try {
	fresh = sessionStorage.getItem('nool-reset') === '1';
	sessionStorage.removeItem('nool-reset');
} catch {
	/* no session storage */
}
const raw: Database = new SQL.Database(fresh ? undefined : ((await loadBytes()) ?? undefined));
if (fresh) saveBytes(raw.export());
raw.exec('PRAGMA foreign_keys = ON;');
raw.exec(SCHEMA);

let timer: ReturnType<typeof setTimeout> | undefined;
let depth = 0;
const persist = () => {
	if (depth) return;
	clearTimeout(timer);
	timer = setTimeout(() => saveBytes(raw.export()), 300);
};
addEventListener('pagehide', () => {
	clearTimeout(timer);
	saveBytes(raw.export());
});

const clean = (v: Value): SqlValue => (v === undefined ? null : typeof v === 'boolean' ? (v ? 1 : 0) : typeof v === 'bigint' ? Number(v) : v);

// node:sqlite takes named parameters without their prefix; sql.js wants them with it.
function bind(sql: string, args: Value[]): SqlValue[] | Record<string, SqlValue> {
	if (args.length === 1 && args[0] && typeof args[0] === 'object' && !(args[0] instanceof Uint8Array)) {
		const o = args[0] as Record<string, Value>;
		const out: Record<string, SqlValue> = {};
		for (const m of sql.matchAll(/([:@$])([A-Za-z_]\w*)/g)) out[m[0]] = clean(o[m[2]]);
		return out;
	}
	return args.map(clean);
}

class Statement {
	constructor(private sql: string) {}
	run(...args: Value[]) {
		raw.run(this.sql, bind(this.sql, args));
		persist();
		return { changes: raw.getRowsModified(), lastInsertRowid: 0 };
	}
	all(...args: Value[]) {
		const st = raw.prepare(this.sql);
		st.bind(bind(this.sql, args));
		const rows: Record<string, SqlValue>[] = [];
		while (st.step()) rows.push(st.getAsObject());
		st.free();
		return rows;
	}
	get(...args: Value[]) {
		return this.all(...args)[0];
	}
}

export const db = {
	prepare: (sql: string) => new Statement(sql),
	exec: (sql: string) => {
		raw.exec(sql);
		if (!/^\s*(SELECT|PRAGMA)/i.test(sql)) persist();
	}
};

export const now = () => new Date().toISOString();
export const uid = () => crypto.randomUUID();

export function tx<T>(fn: () => T): T {
	raw.exec('BEGIN');
	depth++;
	try {
		const result = fn();
		depth--;
		raw.exec('COMMIT');
		persist();
		return result;
	} catch (e) {
		depth--;
		raw.exec('ROLLBACK');
		throw e;
	}
}

export function reorder(table: 'stages' | 'blocks', ids: string[]) {
	const stmt = db.prepare(`UPDATE ${table} SET position = ? WHERE id = ?`);
	tx(() => ids.forEach((id, i) => stmt.run(i, id)));
}

export const params = (row: object) => row as Record<string, Value>;
export const all = <T>(sql: string, ...args: Value[]) => db.prepare(sql).all(...args) as unknown as T[];
export const get = <T>(sql: string, ...args: Value[]) => db.prepare(sql).get(...args) as unknown as T | undefined;
