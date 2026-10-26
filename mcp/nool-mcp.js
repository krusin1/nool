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

const server = new McpServer({ name: 'nool', version: '0.1.0' });

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

await server.connect(new StdioServerTransport());
