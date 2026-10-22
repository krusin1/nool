<script lang="ts">
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import CaseMasthead from '#lib/components/CaseMasthead.svelte';
	import StageSection from '#lib/components/StageSection.svelte';
	import LineageItem from '#lib/components/LineageItem.svelte';
	import Logo from '#lib/components/Logo.svelte';
	import { STAGES, formatDate } from '#lib/stages.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const stageOrder = (id: string) => STAGES.findIndex((s) => s.id === id);

	const sections = $derived(
		STAGES.map((stage) => ({
			stage,
			index: stageOrder(stage.id),
			entries: data.entries
				.filter((e) => e.stage === stage.id)
				.sort((a, b) => a.created_at.localeCompare(b.created_at)),
			board: stage.id === 'moodboard' ? data.board : [],
			notes: data.precedents.filter((p) => p.kept && p.stage === stage.id)
		})).filter((s) => s.entries.length || s.board.length)
	);

	// Kept precedents, numbered in stage order, shared by margin notes and the lineage list.
	const kept = $derived(sections.flatMap((s) => s.notes));
	const refs = $derived(new Map(kept.map((p, i) => [p.id, i + 1])));

	// Figures numbered in reading order.
	const figures = $derived(
		new Map(
			sections
				.flatMap((s) => s.entries)
				.filter((e) => e.type === 'image')
				.map((e, i) => [e.id, i + 1])
		)
	);

	const span = $derived.by(() => {
		const dates = data.entries.map((e) => e.created_at).sort();
		if (!dates.length) return '';
		const a = formatDate(dates[0]);
		const b = formatDate(dates[dates.length - 1]);
		return a === b ? a : `${a} to ${b}`;
	});
</script>

<svelte:head>
	<title>{data.project.title} · Case study</title>
</svelte:head>

<div class="bar">
	<a class="back label" href="/p/{data.project.id}"><ArrowLeft size={14} strokeWidth={1.5} /> Back to workspace</a>
	<a class="mark" href="/" aria-label="Nool home"><Logo size={22} /><span class="display">nool</span></a>
	<span class="label">{data.project.published ? 'Published' : 'Preview'}</span>
</div>

<article class="page">
	<CaseMasthead
		project={data.project}
		{span}
		stages={sections.map((s) => s.stage)}
		entryCount={data.entries.length}
		keptCount={kept.length}
	/>

	{#each sections as section (section.stage.id)}
		<StageSection
			stage={section.stage}
			index={section.index}
			entries={section.entries}
			board={section.board}
			notes={section.notes}
			{figures}
			{refs}
		/>
	{/each}

	<section class="lineage" id="lineage">
		<div class="lin-head">
			<span class="label kicker">Lineage</span>
			<h2 class="display">What this work builds on</h2>
			<p class="muted">Chosen and annotated by the maker. Numbers match the notes in the margin.</p>
		</div>
		{#if kept.length}
			<ol>
				{#each kept as precedent (precedent.id)}
					<LineageItem {precedent} ref={refs.get(precedent.id)!} />
				{/each}
			</ol>
		{:else}
			<p class="label">No precedents kept yet.</p>
		{/if}
	</section>

	<footer class="colophon label">
		Documented on Nool. The maker wrote every entry; AI summarized and found precedents, and the maker chose what to keep.
	</footer>
</article>

<style>
	.bar {
		position: sticky;
		top: 0;
		z-index: 2;
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;
		height: 48px;
		padding: 0 var(--s3);
		border-bottom: var(--border);
		background: var(--bg);
	}

	.bar > :last-child {
		justify-self: end;
	}

	.mark {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		font-size: var(--fs-md);
		font-weight: var(--fw-bold);
		text-decoration: none;
		line-height: 1;
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
		max-width: 1120px;
		margin: 0 auto;
		padding: 0 var(--s4) var(--s10);
	}

	.lineage {
		display: grid;
		grid-template-columns: 96px minmax(0, 1fr);
		gap: var(--s6);
		padding-top: var(--s8);
		border-top: 1px solid var(--text);
	}

	.lin-head,
	ol {
		grid-column: 2;
	}

	.kicker {
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--accent);
	}

	.lin-head h2 {
		margin-top: var(--s1);
		font-size: var(--fs-xl);
		line-height: 1.1;
	}

	.lin-head p {
		margin-top: var(--s1);
	}

	ol {
		list-style: none;
		margin: 0;
		padding: 0;
		border-top: var(--border);
	}

	.colophon {
		max-width: 640px;
		margin: var(--s10) 0 0 calc(96px + var(--s6));
		padding-top: var(--s2);
		border-top: var(--border);
	}

	@media (max-width: 1100px) {
		.page {
			max-width: 720px;
		}

		.lineage {
			grid-template-columns: minmax(0, 1fr);
			gap: var(--s3);
		}

		.lin-head,
		ol {
			grid-column: 1;
		}

		.colophon {
			margin-left: 0;
		}
	}

	@media (max-width: 600px) {
		.bar {
			padding: 0 var(--s2);
		}

		.mark {
			display: none;
		}

		.bar {
			grid-template-columns: 1fr auto;
		}

		.page {
			padding: 0 var(--s2) var(--s8);
		}

		.lin-head h2 {
			font-size: var(--fs-lg);
		}
	}
</style>
