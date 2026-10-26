<script lang="ts">
	import Mail from '@lucide/svelte/icons/mail';
	import { formatDate } from '#lib/format.ts';
	import type { ProjectSummary } from '#lib/types.ts';

	let { summary }: { summary: ProjectSummary } = $props();
	const p = $derived(summary.project);
</script>

<article class="row">
	<a class="main" href="/p/{p.id}">
		<h2 class="title display">{p.title}</h2>
		{#if p.description}<p class="desc">{p.description}</p>{/if}
	</a>
	<div class="meta">
		<span class="progress" aria-label="{summary.filledStages} of {summary.stageCount} stages have blocks">
			{#each Array.from({ length: summary.stageCount }, (_, i) => i < summary.filledStages) as on, i (i)}
				<span class="tick" class:on></span>
			{/each}
		</span>
		<span class="label">{summary.blockCount} blocks</span>
		<span class="label">Updated {formatDate(p.updated_at)}</span>
		<span class="status label" class:posted={p.posted_at}>{p.posted_at ? 'Posted' : 'Mint'}</span>
		<a class="view label" href="/view/{p.id}"><Mail size={14} strokeWidth={1.5} /> Letter</a>
	</div>
</article>

<style>
	.row {
		padding: var(--s4) 0;
		border-bottom: var(--border);
	}

	.main {
		display: block;
		text-decoration: none;
	}

	.title {
		font-size: var(--fs-lg);
		line-height: 1.2;
		transition: color var(--ease);
	}

	.main:hover .title {
		color: var(--accent);
	}

	.desc {
		margin-top: var(--s1);
		max-width: 60ch;
		color: var(--muted);
	}

	.meta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--s1) var(--s3);
		margin-top: var(--s2);
	}

	.progress {
		display: inline-flex;
		gap: 4px;
	}

	.tick {
		width: 14px;
		height: 4px;
		border-radius: 1px;
		background: var(--line);
	}

	.tick.on {
		background: var(--text);
	}

	.status.posted {
		color: var(--accent);
	}

	.view {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		margin-left: auto;
		text-decoration: none;
		transition: color var(--ease);
	}

	.view:hover {
		color: var(--text);
	}

	@media (max-width: 600px) {
		.view {
			margin-left: 0;
		}
	}
</style>
