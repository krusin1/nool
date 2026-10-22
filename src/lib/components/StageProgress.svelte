<script lang="ts">
	import { STAGES } from '#lib/stages.ts';
	import type { Entry } from '#lib/types.ts';

	let { entries }: { entries: Entry[] } = $props();

	const filled = $derived(STAGES.map((s) => entries.some((e) => e.stage === s.id)));
</script>

<span class="progress" aria-label="{filled.filter(Boolean).length} of {STAGES.length} stages documented">
	{#each STAGES as stage, i (stage.id)}
		<span class="tick" class:on={filled[i]} title={stage.label}></span>
	{/each}
</span>

<style>
	.progress {
		display: inline-flex;
		gap: 4px;
		align-items: center;
	}

	.tick {
		width: 16px;
		height: 4px;
		border-radius: 1px;
		background: var(--line);
	}

	.tick.on {
		background: var(--text);
	}
</style>
