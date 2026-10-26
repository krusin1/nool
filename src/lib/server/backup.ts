import { gunzipSync, gzipSync } from 'node:zlib';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { DATA_DIR, UPLOAD_DIR, db, tx } from './db.ts';

// A backup is one gzipped JSON file: a copy of the database plus every uploaded image.
// It is the same file whether it is saved to disk or to Google Drive.

const TABLES = ['projects', 'stages', 'blocks', 'precedents'] as const; // parent tables first
const LOCAL_DIR = join(DATA_DIR, 'backups');
const MAX_BYTES = 500 * 1024 * 1024;

interface BackupFile {
	app: 'nool';
	version: 1;
	created_at: string;
	db: string; // base64 SQLite file
	uploads: Record<string, string>; // file name -> base64
}

export const backupName = (d = new Date()) => `nool-backup-${d.toISOString().slice(0, 16).replace(/[:T]/g, '-')}.nool`;

export function createBackup(): Buffer {
	const tmp = join(DATA_DIR, `.snapshot-${process.pid}.db`);
	rmSync(tmp, { force: true });
	db.exec(`VACUUM INTO '${tmp.replaceAll("'", "''")}'`);
	try {
		const uploads: Record<string, string> = {};
		for (const name of readdirSync(UPLOAD_DIR)) uploads[name] = readFileSync(join(UPLOAD_DIR, name)).toString('base64');
		const file: BackupFile = {
			app: 'nool',
			version: 1,
			created_at: new Date().toISOString(),
			db: readFileSync(tmp).toString('base64'),
			uploads
		};
		return gzipSync(JSON.stringify(file));
	} finally {
		rmSync(tmp, { force: true });
	}
}

function parse(buf: Buffer): BackupFile {
	let file: BackupFile;
	try {
		const raw = gunzipSync(buf, { maxOutputLength: MAX_BYTES });
		file = JSON.parse(raw.toString('utf8'));
	} catch {
		throw new Error("This isn't a Nool backup file.");
	}
	if (file?.app !== 'nool' || file.version !== 1 || typeof file.db !== 'string') {
		throw new Error("This isn't a Nool backup file, or it's from a newer version of Nool.");
	}
	return file;
}

/**
 * Replace all projects with the ones in the backup. Settings (inbox token, Google
 * connection) stay as they are on this computer. A safety copy of the current data is
 * saved first in data/backups.
 */
export function restoreBackup(buf: Buffer): { projects: number } {
	const file = parse(buf);

	mkdirSync(LOCAL_DIR, { recursive: true });
	writeFileSync(join(LOCAL_DIR, `before-restore-${backupName()}`), createBackup());

	const tmp = join(DATA_DIR, `.restore-${process.pid}.db`);
	writeFileSync(tmp, Buffer.from(file.db, 'base64'));
	try {
		db.exec(`ATTACH DATABASE '${tmp.replaceAll("'", "''")}' AS src`);
		try {
			tx(() => {
				for (const t of [...TABLES].reverse()) db.exec(`DELETE FROM main.${t}`);
				for (const t of TABLES) db.exec(`INSERT INTO main.${t} SELECT * FROM src.${t}`);
			});
		} finally {
			db.exec('DETACH DATABASE src');
		}
	} finally {
		rmSync(tmp, { force: true });
	}

	for (const [name, data] of Object.entries(file.uploads ?? {})) {
		const path = join(UPLOAD_DIR, basename(name));
		if (!existsSync(path)) writeFileSync(path, Buffer.from(data, 'base64'));
	}

	const { n } = db.prepare('SELECT COUNT(*) AS n FROM projects').get() as { n: number };
	return { projects: n };
}
