import { clip, getJson, type Candidate } from './types.ts';

const API = 'https://collectionapi.metmuseum.org/public/collection/v1';

interface MetObject {
	objectID: number;
	title: string;
	artistDisplayName: string;
	objectDate: string;
	objectURL: string;
	primaryImageSmall: string;
	medium: string;
	classification: string;
	culture: string;
}

export async function search(q: string, n = 4): Promise<Candidate[]> {
	const r = await getJson<{ objectIDs: number[] | null }>(`${API}/search?hasImages=true&q=${encodeURIComponent(q)}`);
	const ids = (r.objectIDs ?? []).slice(0, n);
	const objects = await Promise.allSettled(ids.map((id) => getJson<MetObject>(`${API}/objects/${id}`)));
	return objects
		.filter((o): o is PromiseFulfilledResult<MetObject> => o.status === 'fulfilled')
		.map(({ value: o }) => ({
			source: 'met',
			title: clip(o.title, 300) || 'Untitled',
			creator: clip(o.artistDisplayName || o.culture, 300),
			year: clip(o.objectDate, 40),
			url: o.objectURL || `https://www.metmuseum.org/art/collection/search/${o.objectID}`,
			image_url: o.primaryImageSmall || null,
			snippet: clip([o.classification, o.medium].filter(Boolean).join('. '), 400)
		}));
}
