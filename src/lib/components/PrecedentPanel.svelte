<script lang="ts">
	import Plus from '@lucide/svelte/icons/plus';
	import PrecedentCard from './PrecedentCard.svelte';
	import PrecedentForm from './PrecedentForm.svelte';
	import { api } from '#lib/api.ts';
	import { autosave } from '#lib/autosave.svelte.ts';
	import type { Precedent } from '#lib/types.ts';

	let {
		precedents = $bindable(),
		stageId,
		stageName
	}: { precedents: Precedent[]; stageId: string; stageName: string } = $props();

	let adding = $state(false);
	const visible = $derived(precedents.filter((p) => p.stage_id === stageId));
	const keptCount = $derived(visible.filter((p) => p.kept).length);

	async function add(input: { title: string; creator: string; year: string; url: string; note: string }) {
		const p = await autosave.now(() => api.addPrecedent({ stage_id: stageId, ...input }));
		precedents.push(p);
		adding = false;
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
			<button class="btn" onclick={() => (adding = true)}><Plus size={16} strokeWidth={1.5} /> Add</button>
		{/if}
	</header>

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
			Add the works, papers and code this stage draws on. Kept precedents become the lineage on your letter.
		</p>
	{/if}

	<p class="soon label">Automatic precedent search is coming. For now, add the ones you know.</p>
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

	.list {
		display: grid;
		gap: 12px;
	}

	.empty {
		padding: var(--s2) 0;
		line-height: 1.5;
	}

	.soon {
		margin-top: var(--s3);
		padding-top: var(--s2);
		border-top: var(--border);
	}

	@media (max-width: 900px) {
		.panel {
			padding: var(--s2);
		}
	}
</style>
