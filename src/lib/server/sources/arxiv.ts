import { clip, TIMEOUT, type Candidate } from './types.ts';

const tag = (xml: string, name: string) => xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`))?.[1] ?? '';
const decode = (s: string) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');

export async function search(q: string, n = 5): Promise<Candidate[]> {
	const res = await fetch(
		`https://export.arxiv.org/api/query?search_query=${encodeURIComponent(`all:${q}`)}&max_results=${n}`,
		{ signal: AbortSignal.timeout(TIMEOUT) }
	);
	if (!res.ok) throw new Error(`${res.status}`);
	const xml = await res.text();
	return [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map(([, e]) => {
		const authors = [...e.matchAll(/<name>([\s\S]*?)<\/name>/g)].map((m) => decode(m[1]));
		return {
			source: 'arxiv' as const,
			title: clip(decode(tag(e, 'title')), 300),
			creator: clip(authors.slice(0, 3).join(', ') + (authors.length > 3 ? ' et al.' : ''), 300),
			year: tag(e, 'published').slice(0, 4),
			url: tag(e, 'id').trim().replace(/^http:/, 'https:'),
			image_url: null,
			snippet: clip(decode(tag(e, 'summary')), 400)
		};
	});
}
