import type { SourceId } from './types.ts';

export const SOURCE_LABELS: Record<SourceId, string> = {
	met: 'The Met',
	cooperhewitt: 'Cooper Hewitt',
	semanticscholar: 'Semantic Scholar',
	arxiv: 'arXiv',
	github: 'GitHub',
	web: 'Web'
};

export function formatDate(iso: string): string {
	return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function postmarkDate(iso: string): string {
	return new Date(iso)
		.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
		.toUpperCase();
}

export const pad2 = (n: number) => String(n).padStart(2, '0');

export function hostOf(url: string): string {
	try {
		return new URL(url).host.replace(/^www\./, '');
	} catch {
		return url;
	}
}
