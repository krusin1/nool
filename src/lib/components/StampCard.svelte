<script lang="ts">
	import ProjectStamp from './ProjectStamp.svelte';
	import type { ProjectSummary } from '#lib/types.ts';

	let { summary }: { summary: ProjectSummary } = $props();
	const p = $derived(summary.project);
</script>

<a class="card" href="/p/{p.id}" aria-label="{p.title}, {p.posted_at ? 'posted' : 'mint'}, {summary.blockCount} blocks">
	<ProjectStamp
		seed={p.id}
		title={p.title}
		image={summary.cover}
		value={summary.blockCount}
		posted={p.posted_at}
		date={p.created_at}
	/>
	<span class="meta label">
		<span>{p.posted_at ? 'Posted' : 'Mint'}</span>
		<span>{summary.blockCount} {summary.blockCount === 1 ? 'block' : 'blocks'}</span>
	</span>
</a>

<style>
	.card {
		display: grid;
		gap: var(--s2);
		text-decoration: none;
	}

	.card:hover :global(.wrap) {
		transform: rotate(0deg) translateY(-4px);
	}

	.meta {
		display: flex;
		justify-content: space-between;
		padding: 0 4px;
	}
</style>
