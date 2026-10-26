<script lang="ts">
	import Plus from '@lucide/svelte/icons/plus';
	import ArrowUp from '@lucide/svelte/icons/arrow-up';
	import ArrowDown from '@lucide/svelte/icons/arrow-down';
	import Trash from '@lucide/svelte/icons/trash';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Check from '@lucide/svelte/icons/check';
	import { pad2 } from '#lib/format.ts';
	import type { Stage } from '#lib/types.ts';

	let {
		stages,
		counts,
		current,
		onselect,
		onrename,
		onadd,
		ondelete,
		onmove
	}: {
		stages: Stage[];
		counts: Record<string, number>;
		current: string;
		onselect: (id: string) => void;
		onrename: (id: string, name: string) => void;
		onadd: () => void;
		ondelete: (id: string) => void;
		onmove: (id: string, dir: -1 | 1) => void;
	} = $props();

	let editing = $state(false);
</script>

<nav class="rail" class:editing aria-label="Stages">
	<div class="head">
		<span class="label">Stages</span>
		<button class="edit label" onclick={() => (editing = !editing)} aria-pressed={editing}>
			{#if editing}<Check size={14} strokeWidth={1.5} /> Done{:else}<Pencil size={14} strokeWidth={1.5} /> Edit{/if}
		</button>
	</div>

	<ol>
		{#each stages as stage, i (stage.id)}
			<li>
				{#if editing}
					<div class="row">
						<span class="num">{pad2(i + 1)}</span>
						<input
							value={stage.name}
							aria-label="Stage {i + 1} name"
							onchange={(e) => onrename(stage.id, e.currentTarget.value)}
							onkeydown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
						/>
						<button onclick={() => onmove(stage.id, -1)} disabled={i === 0} aria-label="Move {stage.name} up"><ArrowUp size={14} strokeWidth={1.5} /></button>
						<button onclick={() => onmove(stage.id, 1)} disabled={i === stages.length - 1} aria-label="Move {stage.name} down"><ArrowDown size={14} strokeWidth={1.5} /></button>
						<button onclick={() => ondelete(stage.id)} disabled={stages.length === 1} aria-label="Delete {stage.name}"><Trash size={14} strokeWidth={1.5} /></button>
					</div>
				{:else}
					<button
						class="stage"
						class:active={stage.id === current}
						aria-current={stage.id === current ? 'step' : undefined}
						onclick={() => onselect(stage.id)}
					>
						<span class="num">{pad2(i + 1)}</span>
						<span class="name">{stage.name}</span>
						<span class="count">{counts[stage.id] ?? 0}</span>
					</button>
				{/if}
			</li>
		{/each}
	</ol>

	{#if editing}
		<button class="add btn btn-ghost" onclick={onadd}><Plus size={16} strokeWidth={1.5} /> Add stage</button>
	{/if}
</nav>

<style>
	.rail {
		padding: var(--s3) var(--s2);
	}

	.head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 var(--s1) var(--s1);
	}

	.edit {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		padding: 2px 4px;
		border: none;
		background: none;
		transition: color var(--ease);
	}

	.edit:hover {
		color: var(--text);
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

	.name {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
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

	.row {
		display: grid;
		grid-template-columns: 20px 1fr repeat(3, 24px);
		align-items: center;
		gap: 2px;
		padding: 2px 0 2px var(--s1);
	}

	.row input {
		min-width: 0;
		height: 30px;
		padding: 0 6px;
		border: var(--border);
		border-radius: 2px;
		background: var(--surface);
		outline: none;
	}

	.row input:focus {
		border-color: var(--accent);
	}

	.row button {
		display: grid;
		place-items: center;
		height: 28px;
		border: none;
		background: none;
		color: var(--muted);
	}

	.row button:hover:not(:disabled) {
		color: var(--text);
	}

	.row button:disabled {
		opacity: 0.3;
		cursor: default;
	}

	.add {
		margin: var(--s1) 0 0 var(--s1);
	}

	@media (max-width: 900px) {
		.rail {
			padding: var(--s1) 0 0;
			border-bottom: var(--border);
		}

		.head {
			padding: 0 var(--s2) 4px;
		}

		.rail:not(.editing) ol {
			display: flex;
			gap: 0;
			overflow-x: auto;
			scrollbar-width: none;
			padding: 0 var(--s1);
		}

		.rail.editing ol {
			padding: 0 var(--s2) var(--s1) 0;
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

		.stage .num {
			display: none;
		}

		.add {
			margin: 0 var(--s2) var(--s1);
		}
	}
</style>
