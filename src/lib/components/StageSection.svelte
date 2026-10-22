<script lang="ts">
	import MarginNote from './MarginNote.svelte';
	import BookSpread from './BookSpread.svelte';
	import { STAGES, type Stage } from '#lib/stages.ts';
	import type { BoardItem, Entry, Precedent } from '#lib/types.ts';

	let {
		stage,
		index,
		entries,
		board = [],
		notes,
		figures,
		refs
	}: {
		stage: Stage;
		index: number;
		entries: Entry[];
		board?: BoardItem[];
		notes: Precedent[];
		figures: Map<string, number>;
		refs: Map<string, number>;
	} = $props();

	const host = (url: string) => new URL(url).host.replace(/^www\./, '');
	const firstText = $derived(entries.find((e) => e.type !== 'image')?.id);
</script>

<section class="stage" class:spread-stage={board.length > 0} id={stage.id}>
	<div class="num display" aria-hidden="true">{String(index + 1).padStart(2, '0')}</div>

	<div class="body">
		<header>
			<span class="label kicker">Stage {index + 1} of {STAGES.length}</span>
			<h2 class="display">{stage.label}</h2>
		</header>

		{#if board.length}
			<figure class="board">
				<BookSpread items={board} />
				<figcaption><span class="fig">Spread</span>Collaged by the maker. Images, notes, colors and lines that set the feel.</figcaption>
			</figure>
		{/if}

		{#each entries as entry (entry.id)}
			{#if entry.type === 'image' && entry.file_path}
				<figure>
					<img src={entry.file_path} alt={entry.raw_content} loading="lazy" />
					<figcaption>
						<span class="fig">Fig. {figures.get(entry.id)}</span>
						{entry.ai_summary || entry.raw_content}
					</figcaption>
				</figure>
			{:else}
				<p class="para" class:lede={entry.id === firstText}>
					{entry.ai_summary || entry.raw_content}
					{#if entry.type === 'link'}
						<a class="src" href={entry.raw_content} target="_blank" rel="noreferrer">{host(entry.raw_content)}</a>
					{/if}
				</p>
			{/if}
		{/each}
	</div>

	{#if notes.length}
		<aside class="margin" aria-label="Precedents for {stage.label}">
			<span class="label">In the margin</span>
			{#each notes as precedent (precedent.id)}
				<MarginNote {precedent} ref={refs.get(precedent.id)!} />
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
		font-variant-numeric: tabular-nums;
	}

	header {
		margin-bottom: var(--s4);
	}

	.kicker {
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	h2 {
		margin-top: var(--s1);
		font-size: var(--fs-xl);
		line-height: 1.1;
		letter-spacing: -0.01em;
	}

	.body {
		min-width: 0;
		display: grid;
		gap: var(--s3);
		align-content: start;
	}

	.para {
		font-size: var(--fs-md);
		line-height: 1.65;
	}

	.lede {
		font-size: var(--fs-lg);
		line-height: 1.4;
	}

	.src {
		margin-left: 4px;
		font-family: var(--font-ui);
		font-size: var(--fs-xs);
		color: var(--muted);
		text-decoration-color: var(--line);
		text-underline-offset: 3px;
		transition: color var(--ease);
	}

	.src:hover {
		color: var(--accent);
	}

	figure {
		margin: var(--s2) 0;
	}

	img {
		width: 100%;
		border: var(--border);
	}

	figcaption {
		margin-top: 12px;
		font-size: var(--fs-xs);
		line-height: 1.5;
		color: var(--muted);
	}

	.fig {
		margin-right: var(--s1);
		color: var(--text);
		font-weight: var(--fw-bold);
	}

	.spread-stage .body {
		grid-column: 2 / 4;
	}

	.spread-stage .margin {
		grid-column: 2 / 4;
		grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
		column-gap: var(--s4);
	}

	.spread-stage .margin > .label {
		grid-column: 1 / -1;
	}

	.board {
		margin: 0;
		min-width: 0;
	}

	.margin {
		display: grid;
		align-content: start;
		gap: 0;
		padding-top: 6px;
	}

	.margin > .label {
		padding-bottom: var(--s1);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	@media (max-width: 1100px) {
		.spread-stage .body,
		.spread-stage .margin {
			grid-column: 1;
		}

		.stage {
			grid-template-columns: minmax(0, 1fr);
			gap: var(--s3);
			padding: var(--s6) 0;
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

		.lede {
			font-size: var(--fs-md);
			line-height: 1.6;
		}
	}
</style>
