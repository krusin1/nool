<script lang="ts">
	import AutoText from '../AutoText.svelte';
	import type { BlockDataMap } from '#lib/types.ts';

	let { data = $bindable(), onchange }: { data: BlockDataMap['quote']; onchange: () => void } = $props();
</script>

<div class="quote">
	<AutoText bind:value={data.text} placeholder="A line worth keeping" class="display q" oninput={onchange} />
	<input bind:value={data.cite} placeholder="Who said it, where" aria-label="Source" oninput={onchange} />
</div>

<style>
	.quote {
		display: grid;
		gap: 6px;
		padding-left: var(--s2);
		border-left: 2px solid var(--text);
	}

	.quote :global(.q) {
		font-size: var(--fs-md);
		font-weight: var(--fw-bold);
		line-height: 1.3;
	}

	input {
		border: none;
		background: transparent;
		font-size: var(--fs-xs);
		color: var(--muted);
		outline: none;
	}
</style>
