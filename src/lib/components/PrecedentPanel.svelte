<script lang="ts">
	import Plus from '@lucide/svelte/icons/plus';
	import Search from '@lucide/svelte/icons/search';
	import PrecedentCard from './PrecedentCard.svelte';
	import PrecedentForm from './PrecedentForm.svelte';
	import { api } from '#lib/api.ts';
	import { autosave } from '#lib/autosave.svelte.ts';
	import { SOURCE_LABELS } from '#lib/format.ts';
	import type { Precedent, SourceId } from '#lib/types.ts';

	let {
		precedents = $bindable(),
		stageId,
		stageName,
		ai
	}: { precedents: Precedent[]; stageId: string; stageName: string; ai: boolean } = $props();

	let adding = $state(false);
	let finding = $state(false);
	let note = $state('');
	let failed = $state('');

	const visible = $derived(precedents.filter((p) => p.stage_id === stageId));
	const keptCount = $derived(visible.filter((p) => p.kept).length);
	const suggested = $derived(visible.some((p) => !p.kept));

	async function add(input: { title: string; creator: string; year: string; url: string; note: string }) {
		const p = await autosave.now(() => api.addPrecedent({ stage_id: stageId, ...input }));
		precedents.push(p);
		adding = false;
	}

	async function find() {
		finding = true;
		failed = '';
		note = '';
		try {
			const r = await api.findPrecedents(stageId);
			precedents = r.precedents;
			const n = r.precedents.filter((p) => p.stage_id === stageId && !p.kept).length;
			const skipped = r.failed.map((s) => SOURCE_LABELS[s as SourceId] ?? s);
			note = [
				n ? `${n} found. Keep the ones that matter; the rest are replaced next time.` : 'Nothing new turned up. Add a few notes to this stage and try again.',
				skipped.length ? `Couldn't reach ${skipped.join(', ')}.` : ''
			].join(' ');
		} catch (e) {
			failed = (e as Error).message;
		} finally {
			finding = false;
		}
	}

	function update(id: string, patch: { kept?: boolean; note?: string }) {
		autosave.now(() => api.updatePrecedent(id, patch));
	}

	function dismiss(id: string) {
		precedents = precedents.filter((p) => p.id !== id);
		autosave.now(() => api.deletePrecedent(id));
	}
</script>

<section class="panel" aria-label="Precedents">
	<header>
		<div>
			<h2>Precedents</h2>
			<span class="label">For {stageName} · {keptCount} kept</span>
		</div>
		{#if !adding}
			<button class="btn btn-ghost" onclick={() => (adding = true)}><Plus size={16} strokeWidth={1.5} /> Add</button>
		{/if}
	</header>

	<div class="find">
		<button class="btn" onclick={find} disabled={finding}>
			<Search size={16} strokeWidth={1.5} />
			{finding ? 'Searching…' : suggested ? 'Find again' : 'Find precedents'}
		</button>
		<span class="label">
			{#if ai}
				Searches museums, papers and code, then your AI picks the closest.
			{:else}
				Searches museums, papers and code by keyword. <a href="/connections#ai">Connect an AI</a> for sharper picks.
			{/if}
		</span>
	</div>
	{#if failed}<p class="label err">{failed}</p>{/if}
	{#if note}<p class="label">{note}</p>{/if}

	{#if adding}
		<PrecedentForm oncancel={() => (adding = false)} onsave={add} />
	{/if}

	{#if visible.length}
		<div class="list">
			{#each precedents as precedent, i (precedent.id)}
				{#if precedent.stage_id === stageId}
					<PrecedentCard
						bind:precedent={precedents[i]}
						onupdate={(patch) => update(precedent.id, patch)}
						ondismiss={() => dismiss(precedent.id)}
					/>
				{/if}
			{/each}
		</div>
	{:else if !adding}
		<p class="empty label">
			Add the works, papers and code this stage draws on, or search for some. Kept precedents become the lineage on
			your letter.
		</p>
	{/if}
</section>

<style>
	.panel {
		padding: var(--s3);
	}

	header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--s2);
		margin-bottom: var(--s2);
	}

	h2 {
		font-size: var(--fs-sm);
	}

	.find {
		display: grid;
		justify-items: start;
		gap: var(--s1);
		padding-bottom: var(--s2);
		margin-bottom: var(--s2);
		border-bottom: var(--border);
	}

	.find .label {
		line-height: 1.5;
	}

	.find a {
		color: var(--accent);
	}

	.err {
		color: #b42318;
		margin-bottom: var(--s1);
	}

	p.label {
		margin-bottom: var(--s2);
		line-height: 1.5;
	}

	button:disabled {
		opacity: 0.6;
		cursor: progress;
	}

	.list {
		display: grid;
		gap: 12px;
	}

	.empty {
		padding: var(--s2) 0;
		line-height: 1.5;
	}

	@media (max-width: 900px) {
		.panel {
			padding: var(--s2);
		}
	}
</style>
