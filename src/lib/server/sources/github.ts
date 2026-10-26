import { clip, getJson, type Candidate } from './types.ts';

interface Repo {
	full_name: string;
	html_url: string;
	description: string | null;
	owner: { login: string };
	created_at: string;
	stargazers_count: number;
}

export async function search(q: string, n = 4): Promise<Candidate[]> {
	const r = await getJson<{ items?: Repo[] }>(
		`https://api.github.com/search/repositories?q=${encodeURIComponent(q)}&sort=stars&per_page=${n}`,
		{ accept: 'application/vnd.github+json' }
	);
	return (r.items ?? []).map((x) => ({
		source: 'github',
		title: x.full_name,
		creator: x.owner.login,
		year: x.created_at.slice(0, 4),
		url: x.html_url,
		image_url: null,
		snippet: clip(`${x.description ?? ''} (${x.stargazers_count.toLocaleString('en-US')} stars)`, 400)
	}));
}
