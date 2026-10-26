#!/usr/bin/env node
// Nool MCP server. Gives an MCP client (Claude Desktop, Cursor, Claude Code…) tools to send
// work into a running Nool app. It talks to Nool's inbox API, so Nool must be running.
//
//   NOOL_URL    where Nool runs (default http://localhost:5173)
//   NOOL_TOKEN  the token from Nool → Connections

import { readFile } from 'node:fs/promises';
import { basename, extname } from 'node:path';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const BASE = (process.env.NOOL_URL ?? 'http://localhost:5173').replace(/\/$/, '');
const TOKEN = process.env.NOOL_TOKEN ?? '';

const MIME = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.avif': 'image/avif' };

async function nool(path, init = {}) {
	let res;
	try {
		res = await fetch(BASE + path, { ...init, headers: { authorization: `Bearer ${TOKEN}`, ...init.headers } });
	} catch {
		throw new Error(`Can't reach Nool at ${BASE}. Is it running (npm run dev)?`);
	}
	const body = await res.json().catch(() => ({}));
	if (!res.ok) throw new Error(body.message ?? `Nool returned ${res.status}`);
	return body;
}

const send = (project, stage, type, data, source) =>
	nool('/api/inbox/blocks', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ project, stage, type, data, source })
	});

const done = (r) => ({ content: [{ type: 'text', text: `Added to ${r.project} → ${r.stage}. Open: ${r.desk}` }] });

const where = {
	project: z.string().describe('Project title or id (see list_projects)'),
	stage: z.string().optional().describe('Stage name or id. Leave out to use the stage the maker worked in last.'),
	source: z.string().optional().describe('The app this came from, shown on the block, e.g. "Figma" or "Blender".')
};

const server = new McpServer({ name: 'nool', version: '0.1.1' });

server.registerTool(
	'list_projects',
	{ title: 'List Nool projects', description: 'List projects in Nool with their stages, to choose where to send work.' },
	async () => {
		const projects = await nool('/api/inbox');
		const text = projects
			.map((p) => `${p.title}${p.posted ? ' (posted)' : ''} [${p.id}]\n  stages: ${p.stages.map((s) => s.name).join(', ')}`)
			.join('\n');
		return { content: [{ type: 'text', text: text || 'No projects yet.' }] };
	}
);

server.registerTool(
	'add_note',
	{ title: 'Add a note', description: 'Add a text note to a stage of a Nool project.', inputSchema: { ...where, text: z.string() } },
	async ({ project, stage, source, text }) => done(await send(project, stage, 'note', { text }, source))
);

server.registerTool(
	'add_link',
	{
		title: 'Add a link',
		description: 'Add a link (a reference, file, prototype or repo) with an optional note on why it matters.',
		inputSchema: { ...where, url: z.string().url(), note: z.string().optional() }
	},
	async ({ project, stage, source, url, note }) => done(await send(project, stage, 'link', { url, note: note ?? '' }, source))
);

server.registerTool(
	'add_quote',
	{ title: 'Add a quote', description: 'Add a quote with who said it.', inputSchema: { ...where, text: z.string(), cite: z.string().optional() } },
	async ({ project, stage, source, text, cite }) => done(await send(project, stage, 'quote', { text, cite: cite ?? '' }, source))
);

server.registerTool(
	'add_image',
	{
		title: 'Add an image',
		description: 'Upload an image (an export, render or screenshot) from a local file path or a URL and add it to a stage.',
		inputSchema: {
			...where,
			path: z.string().optional().describe('Absolute path to an image file on this computer'),
			url: z.string().url().optional().describe('Image URL to download'),
			caption: z.string().optional()
		}
	},
	async ({ project, stage, source, path, url, caption }) => {
		let file;
		if (path) {
			const type = MIME[extname(path).toLowerCase()];
			if (!type) throw new Error('Supported images: PNG, JPEG, GIF, WebP, SVG, AVIF.');
			file = new File([await readFile(path)], basename(path), { type });
		} else if (url) {
			const res = await fetch(url);
			if (!res.ok) throw new Error(`Couldn't download the image (${res.status}).`);
			const type = res.headers.get('content-type')?.split(';')[0] ?? 'image/png';
			file = new File([await res.arrayBuffer()], 'image', { type });
		} else {
			throw new Error('Give either a file path or a URL.');
		}
		const form = new FormData();
		form.append('file', file);
		const { src } = await nool('/api/inbox/uploads', { method: 'POST', body: form });
		return done(await send(project, stage, 'image', { src, caption: caption ?? '' }, source));
	}
);

const json = (path, data) => nool(path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(data) });
const at = { project: where.project, stage: z.string().optional().describe('Stage name or id') };

server.registerTool(
	'read_stage',
	{
		title: 'Read a stage',
		description:
			"Read the maker's notes for one stage of a project, and the precedents they already kept. Use before summarizing a stage or finding precedents for it.",
		inputSchema: at
	},
	async ({ project, stage }) => {
		const q = new URLSearchParams({ project, ...(stage ? { stage } : {}) });
		const r = await nool(`/api/inbox/stage?${q}`);
		const text = [
			`Project: ${r.project}${r.description ? ` (${r.description})` : ''}`,
			`Stage: ${r.stage}`,
			'',
			'Notes:',
			r.notes || '(no notes yet)',
			'',
			`Already kept: ${r.kept.length ? r.kept.join('; ') : 'none'}`
		].join('\n');
		return { content: [{ type: 'text', text }] };
	}
);

server.registerTool(
	'add_summary',
	{
		title: 'Add a stage summary',
		description:
			"Add a summary of a stage as a note. Write it only from that stage's notes (call read_stage first). Never add facts, names, results or numbers that are not in the notes. 3 to 5 plain sentences, past tense, no hype, no em dashes. Show the summary to the maker in the chat too.",
		inputSchema: { ...at, text: z.string() }
	},
	async ({ project, stage, text }) => done(await send(project, stage, 'note', { text }, 'Claude summary'))
);

server.registerTool(
	'search_precedents',
	{
		title: 'Search for precedents',
		description:
			'Search The Met, Cooper Hewitt, Semantic Scholar, arXiv and GitHub for precedents (artworks, design objects, papers, code). Write 3 to 5 short queries (2 to 5 words) specific to the stage: one for museum collections, one or two for papers, one for code. Results already kept on the stage are left out.',
		inputSchema: { ...at, queries: z.array(z.string()).min(1).max(6) }
	},
	async ({ project, stage, queries }) => {
		const r = await json('/api/inbox/search', { project, stage, queries });
		const text = r.results.length
			? r.results.map((c, i) => `${i + 1}. [${c.source}] ${c.title} | ${c.creator} | ${c.year} | ${c.url}${c.image_url ? ` | image: ${c.image_url}` : ''}\n   ${c.snippet}`).join('\n')
			: 'No results.';
		return { content: [{ type: 'text', text: text + (r.failed.length ? `\n\nCould not reach: ${r.failed.join(', ')}` : '') }] };
	}
);

server.registerTool(
	'suggest_precedents',
	{
		title: 'Suggest precedents',
		description:
			"Put up to 8 precedents on a stage's precedent panel for the maker to keep or dismiss. They replace earlier suggestions; kept ones stay. Use results from search_precedents (copy title, creator, year, url, image_url and source exactly) or real works you know, with a real link. For each, write why: one short line on how it relates to this stage, based only on the work's own description and the maker's notes. Never invent works or links.",
		inputSchema: {
			...at,
			items: z
				.array(
					z.object({
						title: z.string(),
						url: z.string().url(),
						creator: z.string().optional(),
						year: z.string().optional(),
						image_url: z.string().optional(),
						source: z.enum(['met', 'cooperhewitt', 'semanticscholar', 'arxiv', 'github', 'web']).optional(),
						why: z.string()
					})
				)
				.min(1)
				.max(8)
		}
	},
	async ({ project, stage, items }) => {
		const r = await json('/api/inbox/precedents', { project, stage, items });
		return { content: [{ type: 'text', text: `Added ${r.added} precedents to ${r.project} → ${r.stage}. The maker can keep or dismiss them in Nool: ${r.desk}` }] };
	}
);

await server.connect(new StdioServerTransport());
