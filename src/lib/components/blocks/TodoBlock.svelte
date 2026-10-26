<script lang="ts">
	import X from '@lucide/svelte/icons/x';
	import type { BlockDataMap } from '#lib/types.ts';

	let { data = $bindable(), onchange }: { data: BlockDataMap['todo']; onchange: () => void } = $props();

	let inputs: HTMLInputElement[] = $state([]);

	function addAfter(i: number) {
		data.items.splice(i + 1, 0, { text: '', done: false });
		onchange();
		queueMicrotask(() => inputs[i + 1]?.focus());
	}

	function remove(i: number) {
		if (data.items.length === 1) return;
		data.items.splice(i, 1);
		onchange();
		queueMicrotask(() => inputs[Math.max(0, i - 1)]?.focus());
	}

	function onkeydown(e: KeyboardEvent, i: number) {
		if (e.key === 'Enter') {
			e.preventDefault();
			addAfter(i);
		} else if (e.key === 'Backspace' && !data.items[i].text) {
			e.preventDefault();
			remove(i);
		}
	}
</script>

<ul>
	{#each data.items as item, i (i)}
		<li class:done={item.done}>
			<input type="checkbox" bind:checked={item.done} onchange={onchange} aria-label="Done" />
			<input
				class="text"
				bind:this={inputs[i]}
				bind:value={item.text}
				placeholder="To try…"
				oninput={onchange}
				onkeydown={(e) => onkeydown(e, i)}
			/>
			<button class="x" onclick={() => remove(i)} aria-label="Remove item" disabled={data.items.length === 1}>
				<X size={14} strokeWidth={1.5} />
			</button>
		</li>
	{/each}
</ul>

<style>
	ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 4px;
	}

	li {
		display: flex;
		align-items: center;
		gap: var(--s1);
	}

	input[type='checkbox'] {
		accent-color: var(--accent);
		width: 16px;
		height: 16px;
	}

	.text {
		flex: 1;
		min-width: 0;
		border: none;
		background: transparent;
		outline: none;
	}

	.done .text {
		color: var(--muted);
		text-decoration: line-through;
	}

	.x {
		display: grid;
		place-items: center;
		width: 24px;
		height: 24px;
		border: none;
		background: none;
		color: var(--muted);
		opacity: 0;
		transition: opacity var(--ease);
	}

	li:hover .x,
	.x:focus-visible {
		opacity: 1;
	}
</style>
