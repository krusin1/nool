import { clip, getJson, type Candidate } from './types.ts';

// Needs a free key from https://collection.cooperhewitt.org/api (saved in Connections).
interface CHObject {
	title: string;
	url: string;
	date: string;
	description: string | null;
	medium: string | null;
	participants?: { person_name: string }[];
	images?: Record<string, { url: string }>[];
}

export async function search(q: string, n = 4, key?: string): Promise<Candidate[]> {
	if (!key) return [];
	const r = await getJson<{ objects?: CHObject[] }>(
		`https://api.collection.cooperhewitt.org/rest/?method=cooperhewitt.search.objects&access_token=${encodeURIComponent(key)}&query=${encodeURIComponent(q)}&has_images=1&per_page=${n}`
	);
	return (r.objects ?? []).map((o) => ({
		source: 'cooperhewitt',
		title: clip(o.title, 300) || 'Untitled',
		creator: clip(o.participants?.[0]?.person_name, 300),
		year: clip(o.date, 40),
		url: o.url,
		image_url: o.images?.[0]?.n?.url ?? o.images?.[0]?.z?.url ?? null,
		snippet: clip(o.description ?? o.medium, 400)
	}));
}
