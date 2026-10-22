<script lang="ts">
	import Frame from '@lucide/svelte/icons/frame';
	import BookOpen from '@lucide/svelte/icons/book-open';
	import CodeXml from '@lucide/svelte/icons/code-xml';
	import Globe from '@lucide/svelte/icons/globe';
	import type { SourceId } from '#lib/types.ts';

	let { source, image_url, alt }: { source: SourceId; image_url: string | null; alt: string } = $props();

	const icons = {
		met: Frame,
		cooperhewitt: Frame,
		semanticscholar: BookOpen,
		arxiv: BookOpen,
		github: CodeXml,
		web: Globe
	};
	const Icon = $derived(icons[source]);
</script>

<div class="thumb">
	{#if image_url}
		<img src={image_url} {alt} loading="lazy" />
	{:else}
		<Icon size={16} strokeWidth={1.5} aria-hidden="true" />
	{/if}
</div>

<style>
	.thumb {
		display: grid;
		place-items: center;
		width: 48px;
		height: 48px;
		flex-shrink: 0;
		border: var(--border);
		border-radius: 2px;
		background: var(--bg);
		color: var(--muted);
		overflow: hidden;
	}

	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
</style>
