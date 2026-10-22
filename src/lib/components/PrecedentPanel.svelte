<script lang="ts">
	import RefreshCw from '@lucide/svelte/icons/refresh-cw';
	import PrecedentCard from './PrecedentCard.svelte';
	import type { Precedent, StageId } from '#lib/types.ts';

	let {
		precedents = $bindable(),
		stage,
		stageLabel
	}: { precedents: Precedent[]; stage: StageId; stageLabel: string } = $props();

	let refreshing = $state(false);
	const visible = $derived(precedents.filter((p) => p.stage === stage));
	const keptCount = $derived(visible.filter((p) => p.kept).length);

	function dismiss(id: string) {
		precedents = precedents.filter((p) => p.id !== id);
	}

	function refresh() {
		// Phase 4 replaces this with a real fetch.
		refreshing = true;
		setTimeout(() => (refreshing = false), 700);
	}
</script>

<section class="panel" aria-label="Precedents">
	<header>
		<div>
			<h2>Precedents</h2>
			<span class="label">For {stageLabel} · {keptCount} kept</span>
		</div>
		<button class="btn" onclick={refresh} disabled={refreshing}>
			<span class="icon" class:spin={refreshing}><RefreshCw size={16} strokeWidth={1.5} /></span>
			Refresh
		</button>
	</header>

	{#if visible.length}
		<div class="list">
			{#each precedents as precedent, i (precedent.id)}
				{#if precedent.stage === stage}
					<PrecedentCard bind:precedent={precedents[i]} ondismiss={() => dismiss(precedent.id)} />
				{/if}
			{/each}
		</div>
	{:else}
		<p class="empty label">No precedents for this stage yet. Add entries, then refresh.</p>
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

	.list {
		display: grid;
		gap: 12px;
	}

	.icon {
		display: inline-flex;
	}

	.spin {
		animation: spin 700ms linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.empty {
		padding: var(--s4) 0;
	}

	@media (max-width: 900px) {
		.panel {
			padding: var(--s2);
		}
	}
</style>
