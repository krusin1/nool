// On-demand help: stage summaries and the precedent finder. Each runs only when the maker presses its button.
import { aiConnected, complete, parseJson } from './ai.ts';
import { db, now, uid } from './db.ts';
import { getSetting } from './repo/settings.ts';
import { getProject } from './repo/projects.ts';
import { getStage } from './repo/stages.ts';
import { listBlocks } from './repo/blocks.ts';
import { listPrecedents } from './repo/precedents.ts';
import * as semanticscholar from './sources/semanticscholar.ts';
import * as arxiv from './sources/arxiv.ts';
import * as met from './sources/met.ts';
import * as cooperhewitt from './sources/cooperhewitt.ts';
import * as github from './sources/github.ts';
import type { Candidate } from './sources/types.ts';
import type { Block, Precedent, SourceId, Stage } from '#lib/types.ts';

function blockText(b: Block): string {
	switch (b.type) {
		case 'note':
			return b.data.text;
		case 'image':
			return b.data.caption ? `[image] ${b.data.caption}` : '';
		case 'link':
			return `[link] ${b.data.url}${b.data.note ? ` (${b.data.note})` : ''}`;
		case 'quote':
			return `[quote] "${b.data.text}"${b.data.cite ? ` (${b.data.cite})` : ''}`;
		case 'todo':
			return b.data.items.map((i) => `[${i.done ? 'x' : ' '}] ${i.text}`).join('\n');
		case 'palette':
			return `[palette] ${b.data.colors.join(', ')}`;
		case 'spread':
			return b.data.items.filter((i) => i.kind !== 'image' && i.kind !== 'swatch').map((i) => i.content).join(' / ');
	}
}

function context(stageId: string) {
	const stage = getStage(stageId);
	if (!stage) throw new Error('Stage not found');
	const project = getProject(stage.project_id)!;
	const blocks = listBlocks(project.id).filter((b) => b.stage_id === stage.id);
	const text = blocks.map(blockText).filter((t) => t.trim()).join('\n\n').slice(0, 12_000);
	return { stage, project, blocks, text };
}

// --- Summaries ---

const SUMMARY_PROMPT = `You summarize a maker's own process notes for one stage of a creative project.
Rules:
- Use only what is in the notes. Never add facts, names, results, motives or numbers that are not there.
- If the notes are thin, say less. Two sentences is fine.
- Write plainly in the first person plural or neutral voice, past tense, like a studio log. No hype, no adjectives of praise, no em dashes.
- 3 to 5 sentences, one paragraph. No heading, no bullet points.`;

export async function summarizeStage(stageId: string): Promise<string> {
	const { stage, project, text } = context(stageId);
	if (!text.trim()) throw new Error('This stage has nothing to summarize yet.');
	const user = `Project: ${project.title}${project.description ? ` (${project.description})` : ''}\nStage: ${stage.name}\n\nNotes:\n${text}`;
	return complete(SUMMARY_PROMPT, user, 500);
}

// --- Precedent finder ---

const SOURCES: Record<Exclude<SourceId, 'web'>, (q: string) => Promise<Candidate[]>> = {
	semanticscholar: (q) => semanticscholar.search(q),
	arxiv: (q) => arxiv.search(q),
	met: (q) => met.search(q),
	cooperhewitt: (q) => cooperhewitt.search(q, 4, getSetting('cooperhewitt_key')),
	github: (q) => github.search(q)
};

const STOP = new Set(
	'a an and the of for to in on with by from at as is are was be this that these those it its into about our we i my you your not or but if then so than'.split(' ')
);

/** Without AI: two plain keyword queries from the title, description and stage. */
function keywordQueries(stage: Stage, title: string, description: string): string[] {
	const words = (s: string) => s.toLowerCase().match(/[a-z0-9][a-z0-9-]+/g)?.filter((w) => !STOP.has(w)) ?? [];
	const base = [...new Set([...words(title), ...words(description)])].slice(0, 4);
	const stageWords = words(stage.name).filter((w) => !['research', 'build', 'outcome', 'spark', 'stage', 'experiments'].includes(w));
	return [...new Set([base.join(' '), [...base.slice(0, 2), ...stageWords.slice(0, 2)].join(' ')])].filter(Boolean);
}

const QUERY_PROMPT = `You write search queries to find precedents (prior art: artworks, design objects, papers, open-source code) for one stage of a maker's project.
Return only a JSON array of 3 to 5 short queries (2 to 5 words each), specific to this stage. Mix: one for museum collections (objects, materials, movements), one or two for research papers, one for code. No explanations.`;

const RANK_PROMPT = `You pick precedents for one stage of a maker's project from search results.
Choose up to 8 that are most useful for this stage. For each, write "why": one short line (under 20 words) on how it relates to the stage, based only on the result's own title and description and the maker's notes. Do not claim anything the result text doesn't support. No em dashes.
Return only JSON: [{"i": <result number>, "why": "..."}]`;

export interface FindResult {
	precedents: Precedent[];
	failed: string[];
	queries: string[];
	usedAi: boolean;
}

export async function findPrecedents(stageId: string): Promise<FindResult> {
	const { stage, project, text } = context(stageId);
	const usedAi = aiConnected();
	const brief = `Project: ${project.title}${project.description ? ` (${project.description})` : ''}\nStage: ${stage.name}\n\nNotes:\n${text.slice(0, 4000) || '(none yet)'}`;

	let queries = keywordQueries(stage, project.title, project.description);
	if (usedAi) {
		const q = parseJson<string[]>(await complete(QUERY_PROMPT, brief, 300));
		if (Array.isArray(q) && q.length) queries = q.filter((x) => typeof x === 'string').slice(0, 5);
	}
	if (!queries.length) throw new Error('Add a title or a few notes first, so there is something to search for.');

	// Every source for every query, in parallel. A source that fails is skipped and reported.
	const failed = new Set<string>();
	const runs = await Promise.all(
		Object.entries(SOURCES).flatMap(([id, run]) =>
			queries.map((q) =>
				run(q).catch(() => {
					failed.add(id);
					return [] as Candidate[];
				})
			)
		)
	);

	// Dedupe, including against what the maker already has on this stage.
	const have = listPrecedents(project.id).filter((p) => p.stage_id === stage.id && p.kept);
	const seen = new Set(have.flatMap((p) => [p.url, p.title.toLowerCase()]));
	const pool: Candidate[] = [];
	for (const c of runs.flat()) {
		const t = c.title.toLowerCase();
		if (!c.url || seen.has(c.url) || seen.has(t)) continue;
		seen.add(c.url);
		seen.add(t);
		pool.push(c);
	}

	let picks: { c: Candidate; why: string }[] = [];
	if (usedAi && pool.length) {
		const list = pool.slice(0, 40).map((c, i) => `${i}. [${c.source}] ${c.title} (${c.creator}, ${c.year}): ${c.snippet.slice(0, 200)}`).join('\n');
		const ranked = parseJson<{ i: number; why: string }[]>(await complete(RANK_PROMPT, `${brief}\n\nResults:\n${list}`, 1200));
		if (Array.isArray(ranked))
			picks = ranked.filter((r) => pool[r.i]).slice(0, 8).map((r) => ({ c: pool[r.i], why: String(r.why ?? '').slice(0, 300) }));
	}
	if (!picks.length) {
		// No AI (or it gave nothing usable): take turns between sources so one doesn't crowd out the rest.
		const lanes = [...new Set(pool.map((c) => c.source))].map((s) => pool.filter((c) => c.source === s));
		for (let i = 0; picks.length < 8 && lanes.some((l) => l[i]); i++)
			for (const l of lanes) if (l[i] && picks.length < 8) picks.push({ c: l[i], why: l[i].snippet });
	}

	// Replace this stage's earlier suggestions. Kept precedents and ones added by hand stay.
	const created = now();
	db.prepare("DELETE FROM precedents WHERE stage_id = ? AND kept = 0 AND source != 'web'").run(stage.id);
	const insert = db.prepare(
		`INSERT INTO precedents (id, project_id, stage_id, source, title, creator, year, url, image_url, snippet, kept, note, created_at)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, '', ?)`
	);
	for (const { c, why } of picks) insert.run(uid(), project.id, stage.id, c.source, c.title, c.creator, c.year, c.url, c.image_url, why, created);

	return { precedents: listPrecedents(project.id), failed: [...failed], queries, usedAi };
}
