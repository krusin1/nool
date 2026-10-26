<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { untrack } from 'svelte';
	import DeskHeader from '#lib/components/DeskHeader.svelte';
	import StageRail from '#lib/components/StageRail.svelte';
	import DeskBlock from '#lib/components/blocks/DeskBlock.svelte';
	import Composer from '#lib/components/Composer.svelte';
	import PrecedentPanel from '#lib/components/PrecedentPanel.svelte';
	import WorkspaceTabs from '#lib/components/WorkspaceTabs.svelte';
	import StageSummary from '#lib/components/StageSummary.svelte';
	import PostOverlay from '#lib/components/PostOverlay.svelte';
	import { api } from '#lib/api.ts';
	import { autosave } from '#lib/autosave.svelte.ts';
	import { coverOf } from '#lib/stamp.ts';
	import type { Block, BlockDataMap, BlockType, Tab } from '#lib/types.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	// The desk edits its own copy and saves changes as they happen.
	const initial = untrack(() => structuredClone(data));
	let project = $state(initial.project);
	let stages = $state(initial.stages);
	let blocks = $state(initial.blocks);
	let precedents = $state(initial.precedents);

	let stageId = $state(initial.stages[0]?.id ?? '');
	let tab = $state<Tab>('blocks');
	let posting = $state(false);

	const stage = $derived(stages.find((s) => s.id === stageId) ?? stages[0]);
	const counts = $derived(
		Object.fromEntries(stages.map((s) => [s.id, blocks.filter((b) => b.stage_id === s.id).length]))
	);
	const stageBlocks = $derived(blocks.filter((b) => b.stage_id === stage?.id));

	// Project
	function editProject() {
		autosave.schedule('project', () =>
			api.updateProject(project.id, { title: project.title, description: project.description })
		);
	}

	async function post() {
		autosave.flush();
		project = await autosave.now(() => api.post(project.id));
		posting = true;
	}

	async function recall() {
		project = await autosave.now(() => api.recall(project.id));
	}

	async function remove() {
		if (!confirm(`Delete "${project.title}" and everything in it? This can't be undone.`)) return;
		await api.deleteProject(project.id);
		await goto('/');
	}

	// Stages
	async function addStage() {
		const s = await autosave.now(() => api.addStage(project.id, `Stage ${stages.length + 1}`));
		stages.push(s);
		stageId = s.id;
	}

	function renameStage(id: string, name: string) {
		const s = stages.find((x) => x.id === id);
		if (!s || !name.trim()) return;
		s.name = name.trim();
		autosave.schedule(`stage:${id}`, () => api.renameStage(id, s.name), 0);
	}

	async function deleteStage(id: string) {
		const s = stages.find((x) => x.id === id);
		const n = counts[id] ?? 0;
		if (!s || stages.length === 1) return;
		if (n && !confirm(`Delete "${s.name}" and its ${n} block${n === 1 ? '' : 's'}?`)) return;
		await autosave.now(() => api.deleteStage(id));
		stages = stages.filter((x) => x.id !== id);
		blocks = blocks.filter((b) => b.stage_id !== id);
		precedents = precedents.filter((p) => p.stage_id !== id);
		if (stageId === id) stageId = stages[0].id;
	}

	function moveStage(id: string, dir: -1 | 1) {
		const i = stages.findIndex((s) => s.id === id);
		const j = i + dir;
		if (j < 0 || j >= stages.length) return;
		[stages[i], stages[j]] = [stages[j], stages[i]];
		autosave.now(() => api.reorderStages(project.id, stages.map((s) => s.id)));
	}

	// Blocks
	async function addBlock<T extends BlockType>(type: T, blockData: BlockDataMap[T]) {
		const b = await autosave.now(() => api.addBlock(stage.id, type, blockData));
		blocks.push(b);
	}

	function saveBlock(b: Block) {
		autosave.schedule(b.id, () => api.updateBlock(b.id, $state.snapshot(b.data)));
	}

	function moveBlock(b: Block, dir: -1 | 1) {
		const ids = stageBlocks.map((x) => x.id);
		const i = ids.indexOf(b.id);
		const j = i + dir;
		if (j < 0 || j >= ids.length) return;
		[ids[i], ids[j]] = [ids[j], ids[i]];
		applyOrder(stage.id, ids);
	}

	function moveToStage(b: Block, target: string) {
		const ids = [...blocks.filter((x) => x.stage_id === target).map((x) => x.id), b.id];
		b.stage_id = target;
		applyOrder(target, ids);
	}

	function applyOrder(target: string, ids: string[]) {
		const others = blocks.filter((x) => x.stage_id !== target);
		const ordered = ids.map((id, i) => Object.assign(blocks.find((x) => x.id === id)!, { position: i }));
		blocks = [...others, ...ordered];
		autosave.now(() => api.reorderBlocks(target, ids));
	}

	// Drag and drop: drag a block by its handle onto another block, or onto a stage in the rail.
	let dragId = $state('');
	let over = $state<{ id: string; after: boolean } | null>(null);

	function dragOver(e: DragEvent, b: Block) {
		if (!dragId || dragId === b.id) return;
		e.preventDefault();
		const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
		over = { id: b.id, after: e.clientY > r.top + r.height / 2 };
	}

	function drop(e: DragEvent) {
		e.preventDefault();
		if (!dragId || !over) return endDrag();
		const ids = stageBlocks.map((x) => x.id).filter((id) => id !== dragId);
		const at = ids.indexOf(over.id) + (over.after ? 1 : 0);
		ids.splice(at, 0, dragId);
		applyOrder(stage.id, ids);
		endDrag();
	}

	function endDrag() {
		dragId = '';
		over = null;
	}

	async function deleteBlock(b: Block) {
		autosave.cancel(b.id);
		blocks = blocks.filter((x) => x.id !== b.id);
		await autosave.now(() => api.deleteBlock(b.id));
	}

	// Coming back from Claude or another app: pick up blocks and precedents it added.
	async function refresh() {
		if (autosave.pending || dragId) return;
		const res = await fetch(`/api/projects/${project.id}`);
		if (!res.ok || autosave.pending) return;
		const fresh = await res.json();
		blocks = fresh.blocks;
		precedents = fresh.precedents;
	}

	function closeOverlay() {
		posting = false;
		invalidateAll();
	}
</script>

<svelte:head>
	<title>{project.title} · Nool</title>
</svelte:head>

<svelte:window onbeforeunload={() => autosave.flush()} onfocus={refresh} />

<div class="desk">
	<DeskHeader bind:project onedit={editProject} onpost={post} onrecall={recall} ondelete={remove} />

	<div class="cols">
		<aside class="rail-col">
			<StageRail
				{stages}
				{counts}
				current={stage?.id ?? ''}
				onselect={(id) => (stageId = id)}
				onrename={renameStage}
				onadd={addStage}
				ondelete={deleteStage}
				onmove={moveStage}
			/>
		</aside>

		<WorkspaceTabs
			active={tab}
			entryCount={stageBlocks.length}
			precedentCount={precedents.filter((p) => p.stage_id === stage?.id).length}
			onselect={(t) => (tab = t)}
		/>

		{#if stage}
			<main class="center" class:hidden-sm={tab !== 'blocks'}>
				<div class="center-inner" class:wide={stageBlocks.some((b) => b.type === 'spread')}>
					<div class="stage-head">
						<input
							class="display stage-name"
							value={stage.name}
							aria-label="Stage name"
							onchange={(e) => renameStage(stage.id, e.currentTarget.value)}
							onkeydown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
						/>
						<StageSummary
							stageId={stage.id}
							projectTitle={project.title}
							stageName={stage.name}
							ai={data.ai}
							empty={!stageBlocks.length}
							onadd={(text) => addBlock('note', { text })}
						/>
					</div>

					<div class="blocks" role="list" ondrop={drop} ondragover={(e) => dragId && e.preventDefault()}>
						{#each blocks as block, i (block.id)}
							{#if block.stage_id === stage.id}
								<!-- svelte-ignore a11y_no_static_element_interactions -->
								<div class="slot" ondragover={(e) => dragOver(e, block)}>
								<DeskBlock
									bind:block={blocks[i]}
									{stages}
									first={stageBlocks[0]?.id === block.id}
									last={stageBlocks.at(-1)?.id === block.id}
									onchange={() => saveBlock(block)}
									onmove={(dir) => moveBlock(block, dir)}
									onmovestage={(target) => moveToStage(block, target)}
									ondelete={() => deleteBlock(block)}
									dragging={dragId === block.id}
									dropBefore={over?.id === block.id && !over.after}
									dropAfter={over?.id === block.id && over.after}
									ondragstart={(e) => {
										dragId = block.id;
										if (e.dataTransfer) {
											e.dataTransfer.effectAllowed = 'move';
											e.dataTransfer.setData('text/x-nool-block', block.id);
										}
									}}
									ondragend={endDrag}
								/>
								</div>
							{/if}
						{/each}
					</div>

					<Composer stageName={stage.name} onadd={addBlock} />
				</div>
			</main>

			<aside class="precedent-col" class:hidden-sm={tab !== 'precedents'}>
				<PrecedentPanel bind:precedents stageId={stage.id} stageName={stage.name} projectTitle={project.title} ai={data.ai} />
			</aside>
		{/if}
	</div>
</div>

{#if posting}
	<PostOverlay {project} cover={coverOf(blocks)} value={blocks.length} onclose={closeOverlay} />
{/if}

<style>
	.desk {
		display: flex;
		flex-direction: column;
		height: 100dvh;
	}

	.cols {
		flex: 1;
		min-height: 0;
		display: grid;
		grid-template-columns: 220px minmax(0, 1fr) 360px;
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
	}

	.center-inner {
		max-width: 720px;
		margin: 0 auto;
		padding: var(--s4) var(--s4) var(--s8);
	}

	.center-inner.wide {
		max-width: 1040px;
	}

	.stage-head {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		align-items: center;
		gap: var(--s1);
		margin-bottom: var(--s3);
	}

	.stage-name {
		width: 100%;
		padding: 0;
		border: none;
		border-bottom: 1px solid transparent;
		background: transparent;
		font-size: var(--fs-xl);
		font-weight: var(--fw-bold);
		line-height: 1.2;
		outline: none;
		transition: border-color var(--ease);
	}

	.stage-name:hover,
	.stage-name:focus {
		border-bottom-color: var(--line);
	}

	.blocks {
		display: grid;
		gap: var(--s2);
		margin-bottom: var(--s2);
	}

	@media (max-width: 1200px) {
		.cols {
			grid-template-columns: 200px minmax(0, 1fr) 300px;
		}

		.center-inner {
			padding: var(--s3) var(--s3) var(--s8);
		}
	}

	@media (max-width: 900px) {
		.desk {
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

		.stage-name {
			font-size: var(--fs-lg);
		}
	}
</style>
