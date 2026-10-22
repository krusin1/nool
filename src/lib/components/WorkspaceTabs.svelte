<script lang="ts">
	import type { Tab } from '#lib/types.ts';

	let {
		active,
		entryCount,
		precedentCount,
		onselect
	}: { active: Tab; entryCount: number; precedentCount: number; onselect: (tab: Tab) => void } = $props();
</script>

<div class="tabs" role="tablist" aria-label="Workspace view">
	<button role="tab" aria-selected={active === 'entries'} class:on={active === 'entries'} onclick={() => onselect('entries')}>
		Entries <span class="n">{entryCount}</span>
	</button>
	<button
		role="tab"
		aria-selected={active === 'precedents'}
		class:on={active === 'precedents'}
		onclick={() => onselect('precedents')}
	>
		Precedents <span class="n">{precedentCount}</span>
	</button>
</div>

<style>
	.tabs {
		display: none;
	}

	@media (max-width: 900px) {
		.tabs {
			display: grid;
			grid-template-columns: 1fr 1fr;
			margin: var(--s2) var(--s2) 0;
			padding: 2px;
			border: var(--border);
			border-radius: var(--radius);
			background: var(--surface);
		}
	}

	button {
		height: 32px;
		border: none;
		border-radius: 2px;
		background: transparent;
		font-size: var(--fs-xs);
		font-weight: var(--fw-bold);
		color: var(--muted);
		transition:
			background var(--ease),
			color var(--ease);
	}

	button.on {
		background: var(--text);
		color: var(--bg);
	}

	.n {
		font-weight: var(--fw-regular);
		opacity: 0.7;
		margin-left: 4px;
	}
</style>
