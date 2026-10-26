<script lang="ts">
	import Plus from '@lucide/svelte/icons/plus';
	import type { BlockDataMap } from '#lib/types.ts';

	let { data = $bindable(), onchange }: { data: BlockDataMap['palette']; onchange: () => void } = $props();

	function add() {
		data.colors.push('#888888');
		onchange();
	}
</script>

<div class="palette">
	{#each data.colors as _, i (i)}
		<label class="chip">
			<input type="color" bind:value={data.colors[i]} oninput={onchange} aria-label="Color {i + 1}" />
			<span class="hex">{data.colors[i].toUpperCase()}</span>
		</label>
	{/each}
	{#if data.colors.length < 12}
		<button class="add" onclick={add} aria-label="Add color"><Plus size={16} strokeWidth={1.5} /></button>
	{/if}
</div>

<style>
	.palette {
		display: flex;
		flex-wrap: wrap;
		gap: var(--s1);
	}

	.chip {
		display: grid;
		gap: 4px;
		width: 72px;
	}

	input[type='color'] {
		width: 72px;
		height: 48px;
		padding: 0;
		border: var(--border);
		border-radius: 2px;
		background: none;
		cursor: pointer;
	}

	input[type='color']::-webkit-color-swatch-wrapper {
		padding: 0;
	}

	input[type='color']::-webkit-color-swatch {
		border: none;
	}

	.hex {
		font-size: var(--fs-xs);
		color: var(--muted);
	}

	.add {
		display: grid;
		place-items: center;
		width: 48px;
		height: 48px;
		border: 1px dashed var(--line);
		border-radius: 2px;
		background: none;
		color: var(--muted);
	}
</style>
