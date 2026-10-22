<script lang="ts">
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	import StageProgress from './StageProgress.svelte';
	import { formatDate } from '#lib/stages.ts';
	import type { Entry, Project } from '#lib/types.ts';

	let { project, entries }: { project: Project; entries: Entry[] } = $props();

	const updated = $derived(
		entries.reduce((latest, e) => (e.created_at > latest ? e.created_at : latest), project.created_at)
	);
</script>

<article class="row">
	<a class="main" href="/p/{project.id}">
		<h2 class="title serif">{project.title}</h2>
		<p class="desc">{project.description}</p>
	</a>
	<div class="meta">
		<StageProgress {entries} />
		<span class="label">{entries.length} entries</span>
		<span class="label">Updated {formatDate(updated)}</span>
		<span class="status label" class:published={project.published}>
			{project.published ? 'Published' : 'Draft'}
		</span>
		<a class="view label" href="/view/{project.id}">
			Preview page <ArrowUpRight size={14} strokeWidth={1.5} />
		</a>
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

	.status.published {
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
