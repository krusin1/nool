<script lang="ts">
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import CaseMasthead from '#lib/components/CaseMasthead.svelte';
	import LetterStage from '#lib/components/LetterStage.svelte';
	import LineageItem from '#lib/components/LineageItem.svelte';
	import Logo from '#lib/components/Logo.svelte';
	import { formatDate, postmarkDate } from '#lib/format.ts';
	import { hasContent } from '#lib/blocks.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const sections = $derived(
		data.stages
			.map((stage, index) => ({
				stage,
				index,
				blocks: data.blocks.filter((b) => b.stage_id === stage.id && hasContent(b)),
				notes: data.precedents.filter((p) => p.kept && p.stage_id === stage.id)
			}))
			.filter((s) => s.blocks.length || s.notes.length)
	);

	// Kept precedents, numbered in reading order, shared by margin notes and the lineage list.
	const kept = $derived(sections.flatMap((s) => s.notes));
	const refs = $derived(new Map(kept.map((p, i) => [p.id, i + 1])));
	const stageName = $derived(new Map(data.stages.map((s) => [s.id, s.name])));

	const figures = $derived(
		new Map(
			data.blocks
				.filter((b) => b.type === 'image' && b.data.src)
				.map((b, i) => [b.id, i + 1])
		)
	);

	const span = $derived.by(() => {
		const dates = data.blocks.map((b) => b.created_at).sort();
		if (!dates.length) return formatDate(data.project.created_at);
		const a = formatDate(dates[0]);
		const b = formatDate(dates[dates.length - 1]);
		return a === b ? a : `${a} to ${b}`;
	});
</script>

<svelte:head>
	<title>{data.project.title} · Case study</title>
	{#if data.project.description}<meta name="description" content={data.project.description} />{/if}
</svelte:head>

<div class="bar">
	<a class="back label" href="/p/{data.project.id}"><ArrowLeft size={14} strokeWidth={1.5} /> Desk</a>
	<a class="mark" href="/" aria-label="Nool"><Logo size={22} /><span class="display">nool</span></a>
	<span class="label status" class:posted={data.project.posted_at}>
		{data.project.posted_at ? `Posted ${postmarkDate(data.project.posted_at)}` : 'Draft letter · not posted yet'}
	</span>
</div>

<article class="page">
	<CaseMasthead
		project={data.project}
		{span}
		{sections}
		total={data.stages.length}
		blockCount={data.blocks.filter(hasContent).length}
		keptCount={kept.length}
	/>

	{#each sections as section (section.stage.id)}
		<LetterStage
			stage={section.stage}
			index={section.index}
			total={data.stages.length}
			blocks={section.blocks}
			notes={section.notes}
			{figures}
			{refs}
		/>
	{/each}

	{#if !sections.length}
		<p class="empty muted">Nothing on this letter yet. Add blocks on the desk and they appear here.</p>
	{/if}

	{#if kept.length}
		<section class="lineage" id="lineage">
			<div class="lin-head">
				<span class="label kicker">Lineage</span>
				<h2 class="display">What this work builds on</h2>
				<p class="muted">Chosen and annotated by the maker. Numbers match the notes in the margin.</p>
			</div>
			<ol>
				{#each kept as precedent (precedent.id)}
					<LineageItem {precedent} ref={refs.get(precedent.id) ?? 0} stageName={stageName.get(precedent.stage_id) ?? ''} />
				{/each}
			</ol>
		</section>
	{/if}

	<footer class="colophon label">Posted with Nool. The maker made the work and chose what this letter builds on.</footer>
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

	.status {
		justify-self: end;
	}

	.status.posted {
		color: var(--accent);
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

	.empty {
		padding: var(--s8) 0;
		border-top: var(--border);
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
			grid-template-columns: auto 1fr;
			gap: var(--s2);
			padding: 0 var(--s2);
		}

		.mark {
			display: none;
		}

		.page {
			padding: 0 var(--s2) var(--s8);
		}

		.lin-head h2 {
			font-size: var(--fs-lg);
		}
	}
</style>
