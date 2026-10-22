<script lang="ts">
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import StageSection from '#lib/components/StageSection.svelte';
	import LineageItem from '#lib/components/LineageItem.svelte';
	import { STAGES, formatDate } from '#lib/stages.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const byStage = $derived(
		STAGES.map((stage) => ({
			stage,
			entries: data.entries
				.filter((e) => e.stage === stage.id)
				.sort((a, b) => a.created_at.localeCompare(b.created_at))
		})).filter((s) => s.entries.length)
	);
	const kept = $derived(data.precedents.filter((p) => p.kept));
	const span = $derived.by(() => {
		const dates = data.entries.map((e) => e.created_at).sort();
		return dates.length ? `${formatDate(dates[0])} to ${formatDate(dates[dates.length - 1])}` : '';
	});
</script>

<svelte:head>
	<title>{data.project.title} · Marginalia</title>
</svelte:head>

<div class="bar">
	<a class="back label" href="/p/{data.project.id}"><ArrowLeft size={14} strokeWidth={1.5} /> Back to workspace</a>
	<span class="label">{data.project.published ? 'Published' : 'Preview'}</span>
</div>

<article class="page">
	<header class="masthead">
		<span class="label">A project documented on Marginalia</span>
		<h1 class="serif">{data.project.title}</h1>
		<p class="dek serif">{data.project.description}</p>
		<p class="label">{span}</p>
	</header>

	{#each byStage as section (section.stage.id)}
		<StageSection stage={section.stage} index={STAGES.indexOf(section.stage)} entries={section.entries} />
	{/each}

	<section class="lineage" id="lineage">
		<header>
			<h2 class="serif">Lineage</h2>
			<p class="muted">The work this project builds on, chosen by the maker.</p>
		</header>
		{#if kept.length}
			<ol>
				{#each kept as precedent (precedent.id)}
					<LineageItem {precedent} />
				{/each}
			</ol>
		{:else}
			<p class="label">No precedents kept yet.</p>
		{/if}
	</section>
</article>

<style>
	.bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 48px;
		padding: 0 var(--s3);
		border-bottom: var(--border);
	}

	.back {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		text-decoration: none;
		transition: color var(--ease);
	}

	.back:hover {
		color: var(--text);
	}

	.page {
		max-width: 680px;
		margin: 0 auto;
		padding: var(--s10) var(--s3) var(--s10);
	}

	.masthead {
		display: grid;
		gap: var(--s2);
		padding-bottom: var(--s2);
	}

	h1 {
		font-size: var(--fs-xl);
		line-height: 1.1;
		letter-spacing: -0.01em;
	}

	.dek {
		font-size: var(--fs-lg);
		font-style: italic;
		line-height: 1.35;
		color: var(--muted);
	}

	.lineage {
		margin-top: var(--s8);
		padding-top: var(--s5);
		border-top: 1px solid var(--text);
	}

	.lineage h2 {
		font-size: var(--fs-lg);
	}

	.lineage header p {
		margin-top: 4px;
	}

	ol {
		list-style: none;
		margin: var(--s2) 0 0;
		padding: 0;
	}

	@media (max-width: 600px) {
		.bar {
			padding: 0 var(--s2);
		}

		.page {
			padding: var(--s6) var(--s2) var(--s8);
		}
	}
</style>
