<script lang="ts">
	import ImagePlus from '@lucide/svelte/icons/image-plus';
	import StickyNote from '@lucide/svelte/icons/sticky-note';
	import Quote from '@lucide/svelte/icons/quote';
	import Palette from '@lucide/svelte/icons/palette';
	import Tag from '@lucide/svelte/icons/tag';
	import RotateCw from '@lucide/svelte/icons/rotate-cw';
	import Trash from '@lucide/svelte/icons/trash';
	import BookSpread from '../BookSpread.svelte';
	import { api } from '#lib/api.ts';
	import type { SpreadItem } from '#lib/types.ts';

	let { items = $bindable(), onchange }: { items: SpreadItem[]; onchange: () => void } = $props();

	let selected = $state<string | null>(null);
	let editing = $state<string | null>(null);
	let fileInput: HTMLInputElement;
	let placed = 0;

	const DEFAULTS: Record<SpreadItem['kind'], { content: string; w: number }> = {
		image: { content: '', w: 22 },
		note: { content: 'A note', w: 14 },
		quote: { content: 'A line worth keeping', w: 20 },
		swatch: { content: '#2B4BFF,#F3EFE6,#111111,#D2462B', w: 14 },
		label: { content: 'Label', w: 16 }
	};

	function add(kind: SpreadItem['kind'], content?: string) {
		// Cascade new pieces so they don't land on top of each other.
		const offset = (placed++ % 6) * 4;
		const item: SpreadItem = {
			id: crypto.randomUUID(),
			kind,
			content: content ?? DEFAULTS[kind].content,
			caption: '',
			x: 10 + offset,
			y: 12 + offset,
			w: DEFAULTS[kind].w,
			rotate: Math.round((Math.random() * 6 - 3) * 10) / 10,
			z: Math.max(0, ...items.map((i) => i.z)) + 1,
			tape: kind === 'image'
		};
		items.push(item);
		selected = item.id;
		if (kind === 'note' || kind === 'quote' || kind === 'label') editing = item.id;
		onchange();
	}

	async function addImages(files: FileList | null) {
		for (const f of Array.from(files ?? [])) {
			if (f.type.startsWith('image/')) add('image', await api.upload(f));
		}
	}

	function rotate() {
		const it = items.find((i) => i.id === selected);
		if (!it) return;
		it.rotate = ((it.rotate + 5 + 180) % 360) - 180;
		onchange();
	}

	function remove() {
		items = items.filter((i) => i.id !== selected);
		selected = null;
		onchange();
	}

	function onkeydown(e: KeyboardEvent) {
		const t = e.target as HTMLElement;
		if (!selected || editing || t.closest('input, textarea, [contenteditable]')) return;
		if (e.key === 'Delete' || e.key === 'Backspace') {
			e.preventDefault();
			remove();
		}
	}
</script>

<svelte:window {onkeydown} />

<div class="editor">
	<div class="toolbar" role="toolbar" aria-label="Add to spread">
		<button class="btn btn-ghost" onclick={() => fileInput.click()}><ImagePlus size={16} strokeWidth={1.5} /> Image</button>
		<button class="btn btn-ghost" onclick={() => add('note')}><StickyNote size={16} strokeWidth={1.5} /> Note</button>
		<button class="btn btn-ghost" onclick={() => add('quote')}><Quote size={16} strokeWidth={1.5} /> Quote</button>
		<button class="btn btn-ghost" onclick={() => add('swatch')}><Palette size={16} strokeWidth={1.5} /> Colors</button>
		<button class="btn btn-ghost" onclick={() => add('label')}><Tag size={16} strokeWidth={1.5} /> Label</button>
		<span class="sep"></span>
		<button class="btn btn-ghost" onclick={rotate} disabled={!selected} aria-label="Rotate selected"><RotateCw size={16} strokeWidth={1.5} /></button>
		<button class="btn btn-ghost" onclick={remove} disabled={!selected} aria-label="Remove selected"><Trash size={16} strokeWidth={1.5} /></button>
	</div>

	<BookSpread bind:items editable bind:selected bind:editing {onchange} />

	<p class="label hint">Drag to arrange. Double-click a note or quote to edit it.</p>

	<input
		bind:this={fileInput}
		class="visually-hidden"
		type="file"
		accept="image/*"
		multiple
		onchange={(e) => addImages(e.currentTarget.files)}
	/>
</div>

<style>
	.editor {
		display: grid;
		gap: var(--s1);
	}

	.toolbar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 2px;
	}

	.sep {
		width: 1px;
		height: 20px;
		margin: 0 var(--s1);
		background: var(--line);
	}

	button:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.hint {
		padding: 0 2px;
	}
</style>
