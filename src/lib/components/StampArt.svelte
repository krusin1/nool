<script lang="ts">
	// Default stamp picture for projects without an image yet: a motif plus the title.
	import type { StampLook } from '#lib/stamp.ts';

	let { motif }: { motif: StampLook['motif'] } = $props();
</script>

<svg class="art" viewBox="0 0 100 120" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
	<g fill="none" stroke="currentColor" stroke-width="1.2">
		{#if motif === 'rings'}
			{#each [10, 20, 30, 40, 50, 60] as r (r)}
				<circle cx="72" cy="30" {r} />
			{/each}
		{:else if motif === 'stripes'}
			{#each Array.from({ length: 14 }, (_, i) => i * 9 - 20) as x (x)}
				<path d="M{x} 0 L{x + 60} 120" />
			{/each}
		{:else if motif === 'sun'}
			<circle cx="50" cy="38" r="16" />
			{#each Array.from({ length: 24 }, (_, i) => (i * Math.PI) / 12) as a (a)}
				<path d="M{50 + Math.cos(a) * 22} {38 + Math.sin(a) * 22} L{50 + Math.cos(a) * 34} {38 + Math.sin(a) * 34}" />
			{/each}
		{:else}
			{#each Array.from({ length: 11 }, (_, i) => i * 10) as v (v)}
				<path d="M{v} 0 V120 M0 {v} H100" />
			{/each}
		{/if}
	</g>
</svg>

<style>
	.art {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		opacity: 0.35;
	}
</style>
