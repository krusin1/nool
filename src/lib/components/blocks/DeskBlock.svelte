<script lang="ts">
	import ArrowUp from '@lucide/svelte/icons/arrow-up';
	import ArrowDown from '@lucide/svelte/icons/arrow-down';
	import Trash from '@lucide/svelte/icons/trash';
	import BlockIcon from './BlockIcon.svelte';
	import NoteBlock from './NoteBlock.svelte';
	import ImageBlock from './ImageBlock.svelte';
	import LinkBlock from './LinkBlock.svelte';
	import QuoteBlock from './QuoteBlock.svelte';
	import TodoBlock from './TodoBlock.svelte';
	import PaletteBlock from './PaletteBlock.svelte';
	import SpreadEditor from './SpreadEditor.svelte';
	import { BLOCK_LABELS } from '#lib/blocks.ts';
	import { formatDate } from '#lib/format.ts';
	import type { Block, Stage } from '#lib/types.ts';

	let {
		block = $bindable(),
		stages,
		first,
		last,
		onchange,
		onmove,
		onmovestage,
		ondelete
	}: {
		block: Block;
		stages: Stage[];
		first: boolean;
		last: boolean;
		onchange: () => void;
		onmove: (dir: -1 | 1) => void;
		onmovestage: (stageId: string) => void;
		ondelete: () => void;
	} = $props();
</script>

<article class="block {block.type}">
	<header>
		<span class="kind label"><BlockIcon type={block.type} size={14} /> {BLOCK_LABELS[block.type]}</span>
		{#if block.source !== 'desk'}
			<span class="via label">via {block.source}</span>
		{/if}
		<time class="label" datetime={block.created_at}>{formatDate(block.created_at)}</time>
		<div class="tools">
			<button onclick={() => onmove(-1)} disabled={first} aria-label="Move up"><ArrowUp size={14} strokeWidth={1.5} /></button>
			<button onclick={() => onmove(1)} disabled={last} aria-label="Move down"><ArrowDown size={14} strokeWidth={1.5} /></button>
			{#if stages.length > 1}
				<select aria-label="Move to stage" value="" onchange={(e) => onmovestage(e.currentTarget.value)}>
					<option value="" disabled>Move to…</option>
					{#each stages as s (s.id)}
						{#if s.id !== block.stage_id}<option value={s.id}>{s.name}</option>{/if}
					{/each}
				</select>
			{/if}
			<button onclick={ondelete} aria-label="Delete block"><Trash size={14} strokeWidth={1.5} /></button>
		</div>
	</header>

	{#if block.type === 'note'}
		<NoteBlock bind:data={block.data} {onchange} />
	{:else if block.type === 'image'}
		<ImageBlock bind:data={block.data} {onchange} />
	{:else if block.type === 'link'}
		<LinkBlock bind:data={block.data} {onchange} />
	{:else if block.type === 'quote'}
		<QuoteBlock bind:data={block.data} {onchange} />
	{:else if block.type === 'todo'}
		<TodoBlock bind:data={block.data} {onchange} />
	{:else if block.type === 'palette'}
		<PaletteBlock bind:data={block.data} {onchange} />
	{:else if block.type === 'spread'}
		<SpreadEditor bind:items={block.data.items} {onchange} />
	{/if}
</article>

<style>
	.block {
		padding: var(--s2) var(--s3) var(--s3);
		border: var(--border);
		border-radius: var(--radius);
		background: var(--surface);
		transition: border-color var(--ease);
	}

	.block:focus-within {
		border-color: var(--muted);
	}

	header {
		display: flex;
		align-items: center;
		gap: 12px;
		min-height: 28px;
		margin-bottom: var(--s1);
	}

	.kind {
		display: inline-flex;
		align-items: center;
		gap: 6px;
	}

	.via {
		padding: 1px 6px;
		border-radius: 2px;
		background: var(--accent-soft);
		color: var(--accent);
	}

	.tools {
		display: flex;
		align-items: center;
		gap: 2px;
		margin-left: auto;
		opacity: 0;
		transition: opacity var(--ease);
	}

	.block:hover .tools,
	.block:focus-within .tools {
		opacity: 1;
	}

	@media (hover: none) {
		.tools {
			opacity: 1;
		}
	}

	.tools button,
	.tools select {
		height: 28px;
		border: none;
		border-radius: 2px;
		background: transparent;
		color: var(--muted);
		transition:
			color var(--ease),
			background var(--ease);
	}

	.tools button {
		display: grid;
		place-items: center;
		width: 28px;
	}

	.tools select {
		max-width: 110px;
		font-size: var(--fs-xs);
		cursor: pointer;
	}

	.tools button:hover:not(:disabled),
	.tools select:hover {
		color: var(--text);
		background: var(--bg);
	}

	.tools button:disabled {
		opacity: 0.3;
		cursor: default;
	}

	time {
		white-space: nowrap;
	}

	@media (max-width: 600px) {
		.block {
			padding: 12px var(--s2) var(--s2);
		}

		time {
			display: none;
		}
	}
</style>
