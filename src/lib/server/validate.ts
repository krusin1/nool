import { error } from '@sveltejs/kit';
import { BLOCK_TYPES, emptyData } from '#lib/blocks.ts';
import type { BlockDataMap, BlockType, SpreadItem } from '#lib/types.ts';

const s = (v: unknown, max = 20000) => (typeof v === 'string' ? v.slice(0, max) : '');
const n = (v: unknown, d = 0) => (typeof v === 'number' && Number.isFinite(v) ? v : d);
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const obj = (v: unknown): Record<string, unknown> => (v && typeof v === 'object' ? (v as Record<string, unknown>) : {});

export function blockType(v: unknown): BlockType {
	if (typeof v === 'string' && (BLOCK_TYPES as string[]).includes(v)) return v as BlockType;
	error(400, `Block type must be one of: ${BLOCK_TYPES.join(', ')}`);
}

const SPREAD_KINDS = ['image', 'note', 'quote', 'swatch', 'label'];

function spreadItem(raw: unknown): SpreadItem {
	const o = obj(raw);
	return {
		id: s(o.id, 64) || crypto.randomUUID(),
		kind: (SPREAD_KINDS.includes(o.kind as string) ? o.kind : 'note') as SpreadItem['kind'],
		content: s(o.content),
		caption: s(o.caption, 500),
		x: n(o.x),
		y: n(o.y),
		w: n(o.w, 15),
		rotate: n(o.rotate),
		z: n(o.z),
		tape: o.tape === true
	};
}

/** Coerce untrusted input into the stored shape for a block type. */
export function blockData<T extends BlockType>(type: T, raw: unknown): BlockDataMap[T] {
	const o = obj(raw ?? emptyData(type));
	const clean: { [K in BlockType]: () => BlockDataMap[K] } = {
		note: () => ({ text: s(o.text) }),
		image: () => ({ src: s(o.src, 2000), caption: s(o.caption, 2000) }),
		link: () => ({ url: s(o.url, 2000), note: s(o.note) }),
		quote: () => ({ text: s(o.text), cite: s(o.cite, 500) }),
		todo: () => ({ items: arr(o.items).map((i) => ({ text: s(obj(i).text, 2000), done: obj(i).done === true })) }),
		palette: () => ({ colors: arr(o.colors).map((c) => s(c, 32)).filter(Boolean).slice(0, 12) }),
		spread: () => ({ items: arr(o.items).slice(0, 200).map(spreadItem) })
	};
	return clean[type]() as BlockDataMap[T];
}
