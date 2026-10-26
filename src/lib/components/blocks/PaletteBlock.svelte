<script lang="ts">
	import Plus from '@lucide/svelte/icons/plus';
	import X from '@lucide/svelte/icons/x';
	import type { BlockDataMap } from '#lib/types.ts';

	let { data = $bindable(), onchange }: { data: BlockDataMap['palette']; onchange: () => void } = $props();

	function add() {
		data.colors.push('#888888');
		onchange();
	}

	function remove(i: number) {
		data.colors.splice(i, 1);
		onchange();
	}
</script>

<div class="palette">
	{#each data.colors as _, i (i)}
		<label class="chip">
			<input type="color" bind:value={data.colors[i]} oninput={onchange} aria-label="Color {i + 1}" />
			<span class="hex">{data.colors[i].toUpperCase()}</span>
			{#if data.colors.length > 1}
				<button class="rm" onclick={(e) => (e.preventDefault(), remove(i))} aria-label="Remove color {i + 1}"><X size={12} strokeWidth={1.5} /></button>
			{/if}
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
		position: relative;
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
	.rm {
		position: absolute;
		top: -6px;
		right: -6px;
		display: grid;
		place-items: center;
		width: 20px;
		height: 20px;
		padding: 0;
		border: var(--border);
		border-radius: 50%;
		background: var(--surface);
		color: var(--muted);
		opacity: 0;
		transition: opacity var(--ease);
	}

	.chip:hover .rm,
	.rm:focus-visible {
		opacity: 1;
	}

	@media (hover: none) {
		.rm {
			opacity: 1;
		}
	}
</style>
