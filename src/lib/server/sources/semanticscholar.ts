import { clip, getJson, type Candidate } from './types.ts';

interface Paper {
	title: string;
	year: number | null;
	url: string;
	abstract: string | null;
	tldr?: { text: string } | null;
	authors: { name: string }[];
}

export async function search(q: string, n = 5): Promise<Candidate[]> {
	const fields = 'title,year,url,abstract,tldr,authors';
	const r = await getJson<{ data?: Paper[] }>(
		`https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(q)}&limit=${n}&fields=${fields}`
	);
	return (r.data ?? []).map((p) => ({
		source: 'semanticscholar',
		title: clip(p.title, 300),
		creator: clip(p.authors.slice(0, 3).map((a) => a.name).join(', ') + (p.authors.length > 3 ? ' et al.' : ''), 300),
		year: p.year ? String(p.year) : '',
		url: p.url,
		image_url: null,
		snippet: clip(p.tldr?.text ?? p.abstract, 400)
	}));
}
