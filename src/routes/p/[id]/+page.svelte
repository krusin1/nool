<script lang="ts">
	import WorkspaceHeader from '#lib/components/WorkspaceHeader.svelte';
	import StageRail from '#lib/components/StageRail.svelte';
	import DropZone from '#lib/components/DropZone.svelte';
	import EntryCard from '#lib/components/EntryCard.svelte';
	import PrecedentPanel from '#lib/components/PrecedentPanel.svelte';
	import WorkspaceTabs from '#lib/components/WorkspaceTabs.svelte';
	import MoodboardEditor from '#lib/components/MoodboardEditor.svelte';
	import { STAGES } from '#lib/stages.ts';
	import type { BoardItem, Entry, EntryType, Precedent, StageId, Tab } from '#lib/types.ts';
	import { untrack } from 'svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	// Local copies so Phase 1 interactions (add, edit, keep, dismiss) work without persistence.
	const initial = untrack(() => structuredClone({ entries: data.entries, precedents: data.precedents, board: data.board }));
	let entries = $state<Entry[]>(initial.entries.sort((a, b) => b.created_at.localeCompare(a.created_at)));
	let precedents = $state<Precedent[]>(initial.precedents);
	let board = $state<BoardItem[]>(initial.board);

	let stage = $state<StageId>('spark');
	let tab = $state<Tab>('entries');

	const current = $derived(STAGES.find((s) => s.id === stage)!);
	const stageEntryCount = $derived(
		stage === 'moodboard' ? board.length : entries.filter((e) => e.stage === stage).length
	);
	const stagePrecedentCount = $derived(precedents.filter((p) => p.stage === stage).length);

	function addEntry(input: { type: EntryType; raw_content: string; file_path: string | null }) {
		entries.unshift({
			id: crypto.randomUUID(),
			project_id: data.project.id,
			stage,
			ai_summary: '',
			created_at: new Date().toISOString(),
			...input
		});
	}
</script>

<svelte:head>
	<title>{data.project.title} · Nool</title>
</svelte:head>

<div class="workspace">
	<WorkspaceHeader project={data.project} />

	<div class="cols">
		<aside class="rail-col">
			<StageRail {entries} boardCount={board.length} current={stage} onselect={(id) => (stage = id)} />
		</aside>

		<WorkspaceTabs
			active={tab}
			entryCount={stageEntryCount}
			precedentCount={stagePrecedentCount}
			onselect={(t) => (tab = t)}
		/>

		<main class="center" class:hidden-sm={tab !== 'entries'}>
			<div class="center-inner" class:wide={stage === 'moodboard'}>
				<div class="stage-head">
					<h2 class="display">{current.label}</h2>
					<p class="muted">{current.hint}</p>
				</div>

				{#if stage === 'moodboard'}
					<MoodboardEditor bind:items={board} projectId={data.project.id} />
				{:else}
				<DropZone stageLabel={current.label} onadd={addEntry} />

				<div class="entries">
					{#each entries as entry, i (entry.id)}
						{#if entry.stage === stage}
							<EntryCard bind:entry={entries[i]} />
						{/if}
					{/each}
					{#if stageEntryCount === 0}
						<p class="empty label">Nothing in {current.label} yet. Add a note, link or image above.</p>
					{/if}
				</div>
				{/if}
			</div>
		</main>

		<aside class="precedent-col" class:hidden-sm={tab !== 'precedents'}>
			<PrecedentPanel bind:precedents {stage} stageLabel={current.label} />
		</aside>
	</div>
</div>

<style>
	.workspace {
		display: flex;
		flex-direction: column;
		height: 100dvh;
	}

	.cols {
		flex: 1;
		min-height: 0;
		display: grid;
		grid-template-columns: 220px minmax(0, 1fr) 380px;
	}

	.rail-col,
	.center,
	.precedent-col {
		overflow-y: auto;
	}

	.rail-col {
		border-right: var(--border);
	}

	.precedent-col {
		border-left: var(--border);
		background: var(--bg);
	}

	.center-inner {
		max-width: 680px;
		margin: 0 auto;
		padding: var(--s4) var(--s4) var(--s8);
	}

	.center-inner.wide {
		max-width: 1040px;
	}

	.stage-head {
		margin-bottom: var(--s3);
	}

	.stage-head h2 {
		font-size: var(--fs-xl);
		line-height: 1.1;
		letter-spacing: -0.01em;
	}

	.stage-head p {
		margin-top: 4px;
	}

	.entries {
		display: grid;
		gap: var(--s2);
		margin-top: var(--s3);
	}

	.empty {
		padding: var(--s4) 0;
		text-align: center;
	}

	@media (max-width: 1200px) {
		.cols {
			grid-template-columns: 200px minmax(0, 1fr) 320px;
		}

		.center-inner {
			padding: var(--s3) var(--s3) var(--s8);
		}
	}

	@media (max-width: 900px) {
		.workspace {
			height: auto;
			min-height: 100dvh;
		}

		.cols {
			display: block;
		}

		.rail-col,
		.center,
		.precedent-col {
			overflow: visible;
			border: none;
		}

		.rail-col {
			position: sticky;
			top: 0;
			z-index: 2;
			background: var(--bg);
		}

		.hidden-sm {
			display: none;
		}

		.center-inner {
			padding: var(--s3) var(--s2) var(--s8);
		}

		.stage-head h2 {
			font-size: var(--fs-lg);
		}
	}
</style>
