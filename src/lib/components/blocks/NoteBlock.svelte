<script lang="ts">
	import AutoText from '../AutoText.svelte';
	import type { BlockDataMap } from '#lib/types.ts';

	let { data = $bindable(), onchange }: { data: BlockDataMap['note']; onchange: () => void } = $props();
</script>

<AutoText bind:value={data.text} placeholder="Write it down…" oninput={onchange} />
