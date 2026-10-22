<script lang="ts">
	// One collaged piece on the spread. Sizes use container units so the whole
	// spread scales like a printed page.
	import type { BoardItem } from '#lib/types.ts';

	let {
		item = $bindable(),
		editable = false,
		selected = false,
		editing = false,
		onpointerdown,
		ondblclick,
		ondone
	}: {
		item: BoardItem;
		editable?: boolean;
		selected?: boolean;
		editing?: boolean;
		onpointerdown?: (e: PointerEvent) => void;
		ondblclick?: () => void;
		ondone?: () => void;
	} = $props();

	let ta: HTMLTextAreaElement | undefined = $state();
	$effect(() => {
		if (editing && ta) {
			ta.focus();
			ta.select();
		}
	});

	const colors = $derived(item.kind === 'swatch' ? item.content.split(',').map((c) => c.trim()) : []);
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_static_element_interactions -->
<div
	class="piece {item.kind}"
	class:editable
	class:selected
	style="left:{item.x}%; top:{item.y}%; width:{item.w}%; z-index:{item.z}; --r:{item.rotate}deg"
	tabindex={editable ? 0 : undefined}
	{onpointerdown}
	{ondblclick}
>
	{#if item.tape}<span class="tape" aria-hidden="true"></span>{/if}

	{#if item.kind === 'image'}
		<img src={item.content} alt={item.caption || 'Moodboard image'} draggable="false" />
		{#if item.caption}<span class="caption">{item.caption}</span>{/if}
	{:else if item.kind === 'swatch'}
		<div class="chips">
			{#each colors as c, i (i)}
				<span class="chip"><span class="sw" style="background:{c}"></span><span class="hex">{c}</span></span>
			{/each}
		</div>
	{:else if editing}
		<textarea
			bind:this={ta}
			bind:value={item.content}
			rows="3"
			onblur={ondone}
			onkeydown={(e) => e.key === 'Escape' && ondone?.()}
			onpointerdown={(e) => e.stopPropagation()}
		></textarea>
	{:else}
		<p class="text" class:display={item.kind === 'quote'}>{item.content}</p>
	{/if}
</div>

<style>
	.piece {
		position: absolute;
		transform: rotate(var(--r));
		transform-origin: center;
		user-select: none;
	}

	.editable {
		cursor: grab;
		touch-action: none;
	}

	.editable:active {
		cursor: grabbing;
	}

	.selected {
		outline: 1.5px solid var(--accent);
		outline-offset: 4px;
	}

	img {
		width: 100%;
		display: block;
		border: 1px solid rgba(0, 0, 0, 0.08);
	}

	.caption {
		display: block;
		margin-top: 0.6cqw;
		font-size: 1.15cqw;
		color: #555;
	}

	.tape {
		position: absolute;
		top: -1.2cqw;
		left: 50%;
		width: 7cqw;
		height: 2.2cqw;
		transform: translateX(-50%) rotate(-4deg);
		background: rgba(230, 214, 160, 0.7);
		z-index: 1;
	}

	.note {
		padding: 1.2cqw 1.4cqw;
		background: #fffdf4;
		border: 1px solid #e8e1cc;
		color: #222;
	}

	.note .text {
		font-size: 1.45cqw;
		line-height: 1.35;
	}

	.quote {
		padding-left: 1.2cqw;
		border-left: 0.35cqw solid #111;
		color: #111;
	}

	.quote .text {
		font-size: 2.1cqw;
		font-weight: var(--fw-bold);
		line-height: 1.1;
	}

	.label .text {
		font-size: 1.05cqw;
		font-weight: var(--fw-bold);
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: #555;
	}

	.chips {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.6cqw;
		padding: 0.8cqw;
		background: #fffdf4;
		border: 1px solid #e8e1cc;
	}

	.chip {
		display: grid;
		gap: 0.3cqw;
	}

	.sw {
		aspect-ratio: 3 / 2;
		border: 1px solid rgba(0, 0, 0, 0.1);
	}

	.hex {
		font-size: 0.95cqw;
		color: #555;
	}

	textarea {
		width: 100%;
		min-height: 6cqw;
		padding: 0.6cqw;
		border: 1px solid var(--accent);
		background: #fffdf4;
		color: #111;
		font-size: 1.45cqw;
		line-height: 1.35;
		resize: none;
		outline: none;
	}
</style>
