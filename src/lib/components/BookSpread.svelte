<script lang="ts">
	// A two-page book spread. Read-only on the published page; draggable in the workspace.
	import BoardPiece from './BoardPiece.svelte';
	import type { BoardItem } from '#lib/types.ts';

	let {
		items = $bindable(),
		editable = false,
		selected = $bindable(null),
		editing = $bindable(null)
	}: {
		items: BoardItem[];
		editable?: boolean;
		selected?: string | null;
		editing?: string | null;
	} = $props();

	let spread: HTMLDivElement;
	let drag: { id: string; startX: number; startY: number; x0: number; y0: number } | null = null;

	function down(e: PointerEvent, item: BoardItem) {
		if (!editable || editing === item.id) return;
		e.preventDefault();
		selected = item.id;
		item.z = Math.max(...items.map((i) => i.z)) + 1;
		drag = { id: item.id, startX: e.clientX, startY: e.clientY, x0: item.x, y0: item.y };
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
		(e.currentTarget as HTMLElement).focus();
	}

	function move(e: PointerEvent) {
		if (!drag) return;
		const rect = spread.getBoundingClientRect();
		const item = items.find((i) => i.id === drag!.id);
		if (!item) return;
		const dx = ((e.clientX - drag.startX) / rect.width) * 100;
		const dy = ((e.clientY - drag.startY) / rect.height) * 100;
		item.x = Math.min(98 - item.w, Math.max(0, drag.x0 + dx));
		item.y = Math.min(96, Math.max(0, drag.y0 + dy));
	}

	function up() {
		drag = null;
	}

	function backgroundDown(e: PointerEvent) {
		if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('page')) {
			selected = null;
			editing = null;
		}
	}
</script>

<div class="scroller">
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="spread"
		class:editable
		bind:this={spread}
		onpointermove={move}
		onpointerup={up}
		onpointercancel={up}
		onpointerdown={backgroundDown}
	>
		<div class="page left"></div>
		<div class="page right"></div>
		<div class="gutter" aria-hidden="true"></div>

		{#each items as item, i (item.id)}
			<BoardPiece
				bind:item={items[i]}
				{editable}
				selected={selected === item.id}
				editing={editing === item.id}
				onpointerdown={(e) => down(e, item)}
				ondblclick={() => editable && (item.kind === 'note' || item.kind === 'quote' || item.kind === 'label') && (editing = item.id)}
				ondone={() => (editing = null)}
			/>
		{/each}

		{#if !items.length}
			<p class="empty">An empty spread. Add images, notes, quotes and colors, then drag them into place.</p>
		{/if}
	</div>
</div>

<style>
	.scroller {
		overflow-x: auto;
		padding: var(--s1) 2px var(--s2);
	}

	.spread {
		position: relative;
		container-type: inline-size;
		min-width: 720px;
		aspect-ratio: 16 / 10;
		color: #111;
	}

	.page {
		position: absolute;
		top: 0;
		bottom: 0;
		width: 50%;
		background: #f6f1e6;
		border: 1px solid #ddd5c2;
	}

	.left {
		left: 0;
		border-radius: 4px 0 0 4px;
		border-right: none;
	}

	.right {
		right: 0;
		border-radius: 0 4px 4px 0;
		border-left: none;
	}

	/* Flat gutter: a darker band and a fold line, no gradients. */
	.gutter {
		position: absolute;
		top: 0;
		bottom: 0;
		left: calc(50% - 1.2%);
		width: 2.4%;
		background: #ece5d5;
		border-left: 1px solid #ddd5c2;
		border-right: 1px solid #ddd5c2;
		pointer-events: none;
	}

	.gutter::after {
		content: '';
		position: absolute;
		left: 50%;
		top: 0;
		bottom: 0;
		border-left: 1px solid #cfc6b0;
	}


	.empty {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		padding: 0 20%;
		text-align: center;
		font-size: 1.4cqw;
		color: #8a8370;
	}
</style>
