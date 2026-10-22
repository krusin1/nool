<script lang="ts">
	import { SOURCE_LABELS, stageLabel } from '#lib/stages.ts';
	import type { Precedent } from '#lib/types.ts';

	let { precedent }: { precedent: Precedent } = $props();
</script>

<li class="item">
	<div class="meta label">
		<span>{stageLabel(precedent.stage)}</span>
		<span>{SOURCE_LABELS[precedent.source]}</span>
	</div>
	<div class="work">
		<a class="title" href={precedent.url} target="_blank" rel="noreferrer">{precedent.title}</a>
		<span class="by muted">{precedent.creator}, {precedent.year}</span>
		{#if precedent.note}
			<p class="note serif">{precedent.note}</p>
		{/if}
	</div>
</li>

<style>
	.item {
		display: grid;
		grid-template-columns: 140px 1fr;
		gap: var(--s3);
		padding: var(--s3) 0;
		border-bottom: var(--border);
	}

	.meta {
		display: grid;
		gap: 2px;
		align-content: start;
		padding-top: 2px;
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
	}

	.note {
		margin-top: var(--s1);
		font-size: var(--fs-md);
		font-style: italic;
		line-height: 1.5;
	}

	@media (max-width: 600px) {
		.item {
			grid-template-columns: 1fr;
			gap: var(--s1);
		}

		.meta {
			display: flex;
			gap: var(--s2);
		}
	}
</style>
