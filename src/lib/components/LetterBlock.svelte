<script lang="ts">
	// A block as it reads on the posted letter.
	import BookSpread from './BookSpread.svelte';
	import { hostOf } from '#lib/format.ts';
	import type { Block } from '#lib/types.ts';

	let { block, lede = false, fig }: { block: Block; lede?: boolean; fig?: number } = $props();
</script>

{#if block.type === 'note' && block.data.text.trim()}
	<p class="para" class:lede>{block.data.text}</p>
{:else if block.type === 'image' && block.data.src}
	<figure>
		<img src={block.data.src} alt={block.data.caption} loading="lazy" />
		<figcaption><span class="fig">Fig. {fig}</span>{block.data.caption}</figcaption>
	</figure>
{:else if block.type === 'link' && block.data.url}
	<p class="para" class:lede>
		{block.data.note}
		<a class="src" href={block.data.url} target="_blank" rel="noreferrer">{hostOf(block.data.url)}</a>
	</p>
{:else if block.type === 'quote' && block.data.text.trim()}
	<blockquote>
		<p class="display">{block.data.text}</p>
		{#if block.data.cite}<cite class="label">{block.data.cite}</cite>{/if}
	</blockquote>
{:else if block.type === 'todo' && block.data.items.some((i) => i.text.trim())}
	<ul class="todo">
		{#each block.data.items.filter((i) => i.text.trim()) as item, i (i)}
			<li class:done={item.done}>{item.text}</li>
		{/each}
	</ul>
{:else if block.type === 'palette' && block.data.colors.length}
	<div class="palette">
		{#each block.data.colors as c, i (i)}
			<span class="chip"><span class="sw" style="background:{c}"></span><span class="label">{c.toUpperCase()}</span></span>
		{/each}
	</div>
{:else if block.type === 'spread' && block.data.items.length}
	<figure class="spread">
		<BookSpread items={block.data.items} />
		<figcaption><span class="fig">Spread</span>Collaged by the maker.</figcaption>
	</figure>
{/if}

<style>
	.para {
		font-size: var(--fs-md);
		line-height: 1.65;
		white-space: pre-line;
	}

	.lede {
		font-size: var(--fs-lg);
		line-height: 1.4;
	}

	.src {
		margin-left: 4px;
		font-size: var(--fs-xs);
		color: var(--muted);
		text-decoration-color: var(--line);
		text-underline-offset: 3px;
		transition: color var(--ease);
	}

	.src:hover {
		color: var(--accent);
	}

	figure {
		margin: var(--s2) 0;
		min-width: 0;
	}

	img {
		width: 100%;
		border: var(--border);
	}

	figcaption {
		margin-top: 12px;
		font-size: var(--fs-xs);
		line-height: 1.5;
		color: var(--muted);
	}

	.fig {
		margin-right: var(--s1);
		color: var(--text);
		font-weight: var(--fw-bold);
	}

	blockquote {
		margin: var(--s2) 0;
		padding-left: var(--s3);
		border-left: 2px solid var(--text);
	}

	blockquote p {
		font-size: var(--fs-lg);
		font-weight: var(--fw-bold);
		line-height: 1.25;
	}

	cite {
		display: block;
		margin-top: var(--s1);
		font-style: normal;
	}

	.todo {
		margin: 0;
		padding-left: 1.2em;
		font-size: var(--fs-md);
		line-height: 1.65;
	}

	.todo .done {
		color: var(--muted);
		text-decoration: line-through;
	}

	.palette {
		display: flex;
		flex-wrap: wrap;
		gap: var(--s2);
	}

	.chip {
		display: grid;
		gap: 4px;
	}

	.sw {
		width: 80px;
		height: 56px;
		border: var(--border);
	}
</style>
