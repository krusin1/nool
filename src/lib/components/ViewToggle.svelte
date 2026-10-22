<script lang="ts">
	import LayoutList from '@lucide/svelte/icons/layout-list';
	import Stamp from '@lucide/svelte/icons/stamp';

	import type { HomeView } from '#lib/types.ts';

	let { view, onchange }: { view: HomeView; onchange: (v: HomeView) => void } = $props();
</script>

<div class="toggle" role="radiogroup" aria-label="View">
	<button role="radio" aria-checked={view === 'stamps'} class:on={view === 'stamps'} onclick={() => onchange('stamps')}>
		<Stamp size={16} strokeWidth={1.5} /> Stamps
	</button>
	<button role="radio" aria-checked={view === 'list'} class:on={view === 'list'} onclick={() => onchange('list')}>
		<LayoutList size={16} strokeWidth={1.5} /> List
	</button>
</div>

<style>
	.toggle {
		display: inline-flex;
		padding: 2px;
		border: var(--border);
		border-radius: var(--radius);
		background: var(--surface);
	}

	button {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		height: 28px;
		padding: 0 10px;
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
</style>
