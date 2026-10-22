<script lang="ts">
	import { SOURCE_LABELS, stageLabel } from '#lib/stages.ts';
	import type { Precedent } from '#lib/types.ts';

	let { precedent, ref }: { precedent: Precedent; ref: number } = $props();
</script>

<li class="item" id="ref-{ref}">
	<span class="ref display">{ref}</span>
	<div class="work">
		<a class="title" href={precedent.url} target="_blank" rel="noreferrer">{precedent.title}</a>
		<span class="by">{precedent.creator}, {precedent.year}</span>
		{#if precedent.note}
			<p class="note">{precedent.note}</p>
		{/if}
	</div>
	<div class="meta label">
		<span>{stageLabel(precedent.stage)}</span>
		<span>{SOURCE_LABELS[precedent.source]}</span>
	</div>
</li>

<style>
	.item {
		display: grid;
		grid-template-columns: 48px minmax(0, 1fr) 140px;
		gap: var(--s3);
		padding: var(--s3) 0;
		border-bottom: var(--border);
		scroll-margin-top: var(--s4);
	}

	.item:target {
		background: var(--accent-soft);
	}

	.ref {
		font-size: var(--fs-lg);
		line-height: 1.1;
		color: var(--accent);
		font-variant-numeric: tabular-nums;
	}

	.work {
		display: grid;
		gap: 2px;
	}

	.title {
		font-weight: var(--fw-bold);
		text-decoration: none;
		transition: color var(--ease);
	}

	.title:hover {
		color: var(--accent);
	}

	.by {
		font-size: var(--fs-xs);
		color: var(--muted);
	}

	.note {
		margin-top: var(--s1);
		font-size: var(--fs-md);
		font-style: italic;
		line-height: 1.5;
	}

	.meta {
		display: grid;
		gap: 2px;
		align-content: start;
		text-align: right;
		padding-top: 2px;
	}

	@media (max-width: 600px) {
		.item {
			grid-template-columns: 32px minmax(0, 1fr);
			gap: var(--s2);
		}

		.meta {
			grid-column: 2;
			display: flex;
			gap: var(--s2);
			text-align: left;
		}
	}
</style>
