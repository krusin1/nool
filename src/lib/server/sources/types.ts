import type { SourceId } from '#lib/types.ts';

/** A search result before it becomes a precedent. */
export interface Candidate {
	source: SourceId;
	title: string;
	creator: string;
	year: string;
	url: string;
	image_url: string | null;
	snippet: string;
}

export const TIMEOUT = 10_000;

export const clip = (s: string | null | undefined, n: number) => {
	const t = (s ?? '').replace(/\s+/g, ' ').trim();
	return t.length > n ? t.slice(0, n - 1).trimEnd() + '…' : t;
};

export async function getJson<T>(url: string, headers: Record<string, string> = {}): Promise<T> {
	const res = await fetch(url, { headers: { 'user-agent': 'Nool (process documentation app)', ...headers }, signal: AbortSignal.timeout(TIMEOUT) });
	if (!res.ok) throw new Error(`${res.status}`);
	return res.json() as Promise<T>;
}
