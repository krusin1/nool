// Export a letter so it can live outside Nool: one self-contained HTML file, or a small
// static site (.zip). Both are made from the letter page itself, so they look the same.
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { zipSync, strToU8 } from 'fflate';
import { readUpload } from './uploads.ts';

export type ExportFormat = 'html' | 'zip';

const FONT = /url\((["']?)([^"')]+\.(?:woff2?|ttf|otf))\1\)/g;
const MIME: Record<string, string> = { woff2: 'font/woff2', woff: 'font/woff', ttf: 'font/ttf', otf: 'font/otf' };

export const slug = (s: string) =>
	s
		.toLowerCase()
		.normalize('NFKD')
		.replace(/[^\w\s-]/g, '')
		.trim()
		.replace(/[\s_]+/g, '-')
		.slice(0, 60) || 'letter';

const dataUri = (type: string, buf: Uint8Array) => `data:${type};base64,${Buffer.from(buf).toString('base64')}`;

type Fetch = typeof fetch;
let get: (origin: string, path: string) => Promise<Response>;
// Static files (built CSS, fonts, files in static/) sit outside SvelteKit's router, so read them
// from disk: build/client in the app, static/ when running from source.
// The built server sits in build/server/..., at a depth that depends on bundling: walk up to build/.
const builtClient = (() => {
	let dir = fileURLToPath(new URL('.', import.meta.url));
	for (let i = 0; i < 6; i++, dir = join(dir, '..')) if (existsSync(join(dir, 'client', '_app'))) return join(dir, 'client');
	return '';
})();
const STATIC_DIRS = [
	builtClient,
	join(process.cwd(), 'client'),
	join(process.env.NOOL_RESOURCES ?? '', 'server', 'client'),
	join(process.cwd(), 'build', 'client'),
	join(process.cwd(), 'static')
];
const TYPES: Record<string, string> = { css: 'text/css', svg: 'image/svg+xml', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp', woff2: 'font/woff2', woff: 'font/woff' };

async function fromDisk(path: string): Promise<Response | null> {
	const clean = decodeURIComponent(path.split('?')[0]);
	if (clean.includes('..')) return null;
	for (const dir of STATIC_DIRS) {
		const file = join(dir, clean);
		if (dir && existsSync(file)) {
			const ext = clean.split('.').pop()!.toLowerCase();
			return new Response(new Uint8Array(await readFile(file)), { headers: { 'content-type': TYPES[ext] ?? 'application/octet-stream' } });
		}
	}
	return null;
}

const getter = (f: Fetch) => async (origin: string, path: string) => {
	const res = (!path.startsWith('/view/') && (await fromDisk(path))) || (await f(new URL(path, origin).href));
	if (!res.ok) throw new Error(`Could not read ${path} (${res.status})`);
	return res;
};

/** `fetch` is SvelteKit's event.fetch, which serves Nool's own pages without going over the network. */
export async function exportLetter(id: string, origin: string, format: ExportFormat, fetch: Fetch) {
	get = getter(fetch);
	const html = await (await get(origin, `/view/${id}?export=1`)).text();
	const title = html.match(/<title>([^<]*)<\/title>/)?.[1]?.replace(/ · Case study$/, '') ?? 'Letter';
	const files: Record<string, Uint8Array> = {};

	// Styles: linked stylesheets (production) and inline style blocks (both), with fonts pulled in.
	let css = '';
	for (const [tag] of html.matchAll(/<link\b[^>]*>/g)) {
		const href = tag.match(/\shref="([^"]+)"/)?.[1];
		if (!href || !/\srel="stylesheet"/.test(tag)) continue;
		const at = new URL(href, `${origin}/view/${id}`);
		// Font URLs inside a stylesheet are relative to the stylesheet itself.
		css += (await (await get(origin, at.pathname)).text()).replace(FONT, (m, q, u) => `url("${new URL(u, at).pathname}")`) + '\n';
	}
	for (const [, body] of html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) css += body + '\n';
	// Every current browser reads woff2, so the older woff copies are left out.
	css = css.replace(/,\s*url\((["']?)[^"')]+\.woff\1\)\s*format\((["'])woff\2\)/g, '');
	const fonts = new Map<string, string>();
	for (const [, , url] of css.matchAll(FONT)) {
		if (fonts.has(url)) continue;
		const name = url.split('/').pop()!.split('?')[0];
		const buf = new Uint8Array(await (await get(origin, url)).arrayBuffer());
		if (format === 'html') fonts.set(url, dataUri(MIME[name.split('.').pop()!] ?? 'font/woff2', buf));
		else {
			files[`assets/${name}`] = buf;
			fonts.set(url, name); // relative to assets/style.css
		}
	}
	css = css.replace(FONT, (m, q, url) => `url("${fonts.get(url) ?? url}")`);

	// The page body, without scripts (the letter needs none) and with uploads pulled in.
	let body = html.match(/<body[^>]*>([\s\S]*)<\/body>/)?.[1] ?? '';
	body = body
		.replace(/<script[\s\S]*?<\/script>/g, '')
		.replace(/<!--[\s\S]*?-->/g, '')
		.replace(/\s(on\w+)="[^"]*"/g, '');
	const media = new Map<string, string>();
	const SRC = /\ssrc="(\/[^"/][^"]*)"/g;
	for (const [, src] of body.matchAll(SRC)) {
		if (media.has(src)) continue;
		const name = src.split('/').pop()!.split('?')[0];
		let file = src.startsWith('/uploads/') ? await readUpload(name) : null;
		if (!file) {
			const res = await get(origin, src).catch(() => null);
			if (!res) continue;
			file = { type: res.headers.get('content-type') ?? 'application/octet-stream', body: Buffer.from(await res.arrayBuffer()) };
		}
		if (format === 'html') media.set(src, dataUri(file.type, file.body));
		else {
			files[`images/${name}`] = file.body;
			media.set(src, `images/${name}`);
		}
	}
	body = body.replace(SRC, (m, src) => ` src="${media.get(src) ?? src}"`);

	const description = html.match(/<meta name="description" content="([^"]*)"/)?.[1];
	const head = `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>${description ? `\n<meta name="description" content="${description}">` : ''}
<meta name="generator" content="Nool">`;
	const name = slug(title);

	if (format === 'html') {
		const page = `<!doctype html>\n<html lang="en">\n<head>\n${head}\n<style>\n${css}</style>\n</head>\n<body>\n${body}\n</body>\n</html>\n`;
		return { name: `${name}.html`, type: 'text/html; charset=utf-8', body: Buffer.from(page) };
	}

	files['assets/style.css'] = strToU8(css);
	files['index.html'] = strToU8(
		`<!doctype html>\n<html lang="en">\n<head>\n${head}\n<link rel="stylesheet" href="assets/style.css">\n</head>\n<body>\n${body}\n</body>\n</html>\n`
	);
	files['README.txt'] = strToU8(
		[
			`${title}: a case study exported from Nool.`,
			'',
			'Open index.html in any browser to view it. To put it online, upload this whole folder',
			'(index.html with the assets and images folders next to it) to any static host, for',
			'example Netlify Drop, GitHub Pages or Vercel, or link to it from your portfolio.',
			'The images folder also holds every image at full size, ready to reuse.'
		].join('\n')
	);
	return { name: `${name}.zip`, type: 'application/zip', body: Buffer.from(zipSync(files, { level: 6 })) };
}

/** Desktop: save into Downloads (never overwriting) and return the path. */
export async function saveToDownloads(name: string, body: Buffer) {
	const dir = existsSync(join(homedir(), 'Downloads')) ? join(homedir(), 'Downloads') : homedir();
	const dot = name.lastIndexOf('.');
	let path = join(dir, name);
	for (let i = 2; existsSync(path); i++) path = join(dir, `${name.slice(0, dot)}-${i}${name.slice(dot)}`);
	await writeFile(path, body);
	return path;
}
