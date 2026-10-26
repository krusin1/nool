import type { Block, BlockDataMap, BlockType } from './types.ts';

// Block registry shared by the desk, the inbox API and the MCP server docs.
export const BLOCK_LABELS: Record<BlockType, string> = {
	note: 'Note',
	image: 'Image',
	link: 'Link',
	quote: 'Quote',
	todo: 'Checklist',
	palette: 'Colors',
	spread: 'Spread'
};

export const BLOCK_TYPES = Object.keys(BLOCK_LABELS) as BlockType[];

export function emptyData<T extends BlockType>(type: T): BlockDataMap[T] {
	const defaults: BlockDataMap = {
		note: { text: '' },
		image: { src: '', caption: '' },
		link: { url: '', note: '' },
		quote: { text: '', cite: '' },
		todo: { items: [{ text: '', done: false }] },
		palette: { colors: ['#2B4BFF', '#F3EFE6', '#111111', '#D2462B'] },
		spread: { items: [] }
	};
	return defaults[type];
}

export const isUrl = (s: string) => /^https?:\/\/\S+$/i.test(s.trim());

/** Whether a block has anything to show on the letter. Empty blocks stay on the desk. */
export function hasContent(b: Block): boolean {
	switch (b.type) {
		case 'note':
			return !!b.data.text.trim();
		case 'image':
			return !!b.data.src;
		case 'link':
			return !!b.data.url;
		case 'quote':
			return !!b.data.text.trim();
		case 'todo':
			return b.data.items.some((i) => i.text.trim());
		case 'palette':
			return b.data.colors.length > 0;
		case 'spread':
			return b.data.items.length > 0;
	}
}
