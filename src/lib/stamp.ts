// Each project gets its own stamp: palette, tilt and motif come from a hash of its id,
// so a new project always looks like a new stamp and stays the same on every visit.

import type { Block } from './types.ts';

export interface StampLook {
	paper: string;
	ink: string;
	tilt: number;
	motif: 'rings' | 'stripes' | 'sun' | 'grid';
}

const PALETTES = [
	{ paper: '#F3EFE6', ink: '#2B4BFF' },
	{ paper: '#F6E7D8', ink: '#C2410C' },
	{ paper: '#E7EEE4', ink: '#2F6B4F' },
	{ paper: '#EFE8F3', ink: '#6B3FA0' },
	{ paper: '#F5EFD6', ink: '#8A6400' },
	{ paper: '#E4ECF2', ink: '#1F5F8B' },
	{ paper: '#F4E4E4', ink: '#A3243B' }
];

const MOTIFS: StampLook['motif'][] = ['rings', 'stripes', 'sun', 'grid'];

export function hash(s: string): number {
	let h = 2166136261;
	for (let i = 0; i < s.length; i++) {
		h ^= s.charCodeAt(i);
		h = Math.imul(h, 16777619);
	}
	return h >>> 0;
}

export function stampLook(seed: string): StampLook {
	const h = hash('p:' + (seed || 'untitled'));
	const p = PALETTES[h % PALETTES.length];
	return {
		...p,
		tilt: (((h >>> 8) % 7) - 3) * 0.6,
		motif: MOTIFS[(h >>> 16) % MOTIFS.length]
	};
}

// Perforated edge as an SVG mask, for a stamp with a 4:5 aspect ratio.
function perforationMask(): string {
	const W = 200,
		H = 250,
		r = 5.5,
		step = 12.5;
	let holes = '';
	for (let x = 0; x <= W; x += step) holes += `<circle cx="${x}" cy="0" r="${r}"/><circle cx="${x}" cy="${H}" r="${r}"/>`;
	for (let y = 0; y <= H; y += step) holes += `<circle cx="0" cy="${y}" r="${r}"/><circle cx="${W}" cy="${y}" r="${r}"/>`;
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><defs><mask id="m"><rect width="${W}" height="${H}" fill="white"/><g fill="black">${holes}</g></mask></defs><rect width="${W}" height="${H}" fill="black" mask="url(#m)"/></svg>`;
	return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

export const PERFORATION = perforationMask();

/** The stamp's picture: the last image in the project, reading stages in order. */
export function coverOf(blocks: Block[]): string | null {
	for (let i = blocks.length - 1; i >= 0; i--) {
		const b = blocks[i];
		if (b.type === 'image' && b.data.src) return b.data.src;
		if (b.type === 'spread') {
			const img = b.data.items.findLast((it) => it.kind === 'image' && it.content);
			if (img) return img.content;
		}
	}
	return null;
}
