// Tables, shared by the desktop database and the browser preview.
export const SCHEMA = `
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
`;
