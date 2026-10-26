<script lang="ts">
	import MarginNote from './MarginNote.svelte';
	import LetterBlock from './LetterBlock.svelte';
	import { pad2 } from '#lib/format.ts';
	import type { Block, Precedent, Stage } from '#lib/types.ts';

	let {
		stage,
		index,
		total,
		blocks,
		notes,
		figures,
		refs
	}: {
		stage: Stage;
		index: number;
		total: number;
		blocks: Block[];
		notes: Precedent[];
		figures: Map<string, number>;
		refs: Map<string, number>;
	} = $props();

	const wide = $derived(blocks.some((b) => b.type === 'spread'));
	const lede = $derived(blocks.find((b) => b.type === 'note' || b.type === 'link')?.id);
</script>

<section class="stage" class:wide id="stage-{stage.id}">
	<div class="num display" aria-hidden="true">{pad2(index + 1)}</div>

	<div class="body">
		<header>
			<span class="label kicker">Stage {index + 1} of {total}</span>
			<h2 class="display">{stage.name}</h2>
		</header>
		{#each blocks as block (block.id)}
			<LetterBlock {block} lede={block.id === lede} fig={figures.get(block.id)} />
		{/each}
	</div>

	{#if notes.length}
		<aside class="margin" aria-label="Precedents for {stage.name}">
			<span class="label">In the margin</span>
			{#each notes as precedent (precedent.id)}
				<MarginNote {precedent} ref={refs.get(precedent.id) ?? 0} />
			{/each}
		</aside>
	{/if}
</section>

<style>
	.stage {
		display: grid;
		grid-template-columns: 96px minmax(0, 640px) 240px;
		gap: var(--s6);
		padding: var(--s8) 0;
		border-top: var(--border);
	}

	.num {
		font-size: var(--fs-xl);
		line-height: 1;
		color: var(--muted);
	}

	header {
		margin-bottom: var(--s2);
	}

	.kicker {
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	h2 {
		margin-top: var(--s1);
		font-size: var(--fs-xl);
		line-height: 1.1;
	}

	.body {
		min-width: 0;
		display: grid;
		gap: var(--s3);
		align-content: start;
	}

	.wide .body,
	.wide .margin {
		grid-column: 2 / 4;
	}

	.wide .margin {
		grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
		column-gap: var(--s4);
	}

	.wide .margin > .label {
		grid-column: 1 / -1;
	}

	.margin {
		display: grid;
		align-content: start;
		padding-top: 6px;
	}

	.margin > .label {
		padding-bottom: var(--s1);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	@media (max-width: 1100px) {
		.stage {
			grid-template-columns: minmax(0, 1fr);
			gap: var(--s3);
			padding: var(--s6) 0;
		}

		.wide .body,
		.wide .margin {
			grid-column: 1;
		}

		.num {
			display: none;
		}

		.margin {
			padding: var(--s2);
			border: var(--border);
			border-radius: var(--radius);
			background: var(--surface);
		}

		.margin :global(.note:first-of-type) {
			border-top: none;
		}
	}

	@media (max-width: 600px) {
		h2 {
			font-size: var(--fs-lg);
		}
	}
</style>
