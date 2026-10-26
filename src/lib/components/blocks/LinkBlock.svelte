<script lang="ts">
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	import AutoText from '../AutoText.svelte';
	import { hostOf } from '#lib/format.ts';
	import type { BlockDataMap } from '#lib/types.ts';

	let { data = $bindable(), onchange }: { data: BlockDataMap['link']; onchange: () => void } = $props();
</script>

<div class="link">
	<div class="url">
		<input bind:value={data.url} placeholder="https://" aria-label="Link" oninput={onchange} />
		{#if data.url}
			<a href={data.url} target="_blank" rel="noreferrer" aria-label="Open {hostOf(data.url)}">
				{hostOf(data.url)} <ArrowUpRight size={14} strokeWidth={1.5} />
			</a>
		{/if}
	</div>
	<AutoText bind:value={data.note} placeholder="Why it matters" oninput={onchange} />
</div>

<style>
	.link {
		display: grid;
		gap: var(--s1);
	}

	.url {
		display: flex;
		align-items: center;
		gap: var(--s1);
		padding: 8px 12px;
		border: var(--border);
		border-radius: var(--radius);
	}

	input {
		flex: 1;
		min-width: 0;
		border: none;
		background: transparent;
		font-size: var(--fs-xs);
		color: var(--muted);
		outline: none;
	}

	a {
		display: inline-flex;
		align-items: center;
		gap: 2px;
		flex-shrink: 0;
		font-weight: var(--fw-bold);
		text-decoration: none;
		transition: color var(--ease);
	}

	a:hover {
		color: var(--accent);
	}
</style>
