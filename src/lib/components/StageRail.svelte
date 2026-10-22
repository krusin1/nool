<script lang="ts">
	import { STAGES } from '#lib/stages.ts';
	import type { Entry, StageId } from '#lib/types.ts';

	let {
		entries,
		boardCount = 0,
		current,
		onselect
	}: { entries: Entry[]; boardCount?: number; current: StageId; onselect: (id: StageId) => void } = $props();

	const counts = $derived(
		Object.fromEntries(
			STAGES.map((s) => [s.id, s.id === 'moodboard' ? boardCount : entries.filter((e) => e.stage === s.id).length])
		)
	);
</script>

<nav class="rail" aria-label="Stages">
	<span class="label heading">Stages</span>
	<ol>
		{#each STAGES as stage, i (stage.id)}
			<li>
				<button
					class="stage"
					class:active={stage.id === current}
					aria-current={stage.id === current ? 'step' : undefined}
					onclick={() => onselect(stage.id)}
				>
					<span class="num">{String(i + 1).padStart(2, '0')}</span>
					<span class="name">{stage.label}</span>
					<span class="count">{counts[stage.id]}</span>
				</button>
			</li>
		{/each}
	</ol>
</nav>

<style>
	.rail {
		padding: var(--s3) var(--s2);
	}

	.heading {
		display: block;
		padding: 0 var(--s1) var(--s1);
	}

	ol {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 2px;
	}

	.stage {
		display: grid;
		grid-template-columns: 24px 1fr auto;
		align-items: center;
		gap: var(--s1);
		width: 100%;
		padding: var(--s1);
		border: none;
		border-left: 2px solid transparent;
		border-radius: 0 var(--radius) var(--radius) 0;
		background: transparent;
		text-align: left;
		transition:
			background var(--ease),
			color var(--ease),
			border-color var(--ease);
	}

	.stage:hover {
		background: var(--surface);
	}

	.num,
	.count {
		font-size: var(--fs-xs);
		color: var(--muted);
		font-variant-numeric: tabular-nums;
	}

	.stage.active {
		border-left-color: var(--accent);
		background: var(--surface);
	}

	.stage.active .name,
	.stage.active .num {
		color: var(--accent);
		font-weight: var(--fw-bold);
	}

	@media (max-width: 900px) {
		.rail {
			padding: var(--s1) 0 0;
			border-bottom: var(--border);
		}

		.heading {
			display: none;
		}

		ol {
			display: flex;
			gap: 0;
			overflow-x: auto;
			scrollbar-width: none;
			padding: 0 var(--s1);
		}

		.stage {
			display: flex;
			gap: 6px;
			padding: var(--s1) 12px 12px;
			border-left: none;
			border-bottom: 2px solid transparent;
			border-radius: 0;
			white-space: nowrap;
		}

		.stage:hover,
		.stage.active {
			background: transparent;
		}

		.stage.active {
			border-bottom-color: var(--accent);
		}

		.num {
			display: none;
		}
	}
</style>
