import { db, tx, uid } from './db.ts';
import seed from './seed-data.json';

// Demo projects, inserted the first time the app runs with an empty database.
// `npm run seed` deletes the database so they are inserted again on next start.
export function seedIfEmpty() {
	const { n } = db.prepare('SELECT COUNT(*) AS n FROM projects').get() as { n: number };
	if (n > 0) return;

	const insProject = db.prepare(
		'INSERT INTO projects (id, title, description, created_at, updated_at, posted_at) VALUES (?, ?, ?, ?, ?, ?)'
	);
	const insStage = db.prepare('INSERT INTO stages (id, project_id, name, position) VALUES (?, ?, ?, ?)');
	const insBlock = db.prepare(
		`INSERT INTO blocks (id, project_id, stage_id, type, data, position, source, created_at, updated_at)
		 VALUES (?, ?, ?, ?, ?, ?, 'desk', ?, ?)`
	);
	const insPrecedent = db.prepare(
		`INSERT INTO precedents (id, project_id, stage_id, source, title, creator, year, url, image_url, snippet, kept, note, created_at)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
	);

	tx(() => {
		for (const p of seed) {
			const pid = uid();
			insProject.run(pid, p.title, p.description, p.created_at, p.updated_at, p.posted_at);
			const stageIds = new Map<string, string>();
			p.stages.forEach((s, i) => {
				const sid = uid();
				stageIds.set(s.name, sid);
				insStage.run(sid, pid, s.name, i);
				s.blocks.forEach((b, j) =>
					insBlock.run(uid(), pid, sid, b.type, JSON.stringify(b.data), j, b.created_at, b.created_at)
				);
			});
			for (const x of p.precedents) {
				const sid = stageIds.get(x.stage);
				if (!sid) continue;
				insPrecedent.run(uid(), pid, sid, x.source, x.title, x.creator, x.year, x.url, x.image_url, x.snippet, x.kept ? 1 : 0, x.note, p.created_at);
			}
		}
	});
}
