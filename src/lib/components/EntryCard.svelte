<script lang="ts">
	import EntryTypeIcon from './EntryTypeIcon.svelte';
	import SummaryEditor from './SummaryEditor.svelte';
	import { formatDate } from '#lib/stages.ts';
	import type { Entry } from '#lib/types.ts';

	let { entry = $bindable() }: { entry: Entry } = $props();

	const typeLabel = { text: 'Note', image: 'Image', link: 'Link', voice: 'Voice note' };
	const host = $derived(entry.type === 'link' ? new URL(entry.raw_content).host.replace(/^www\./, '') : '');
</script>

<article class="entry">
	<div class="meta label">
		<span class="type"><EntryTypeIcon type={entry.type} /> {typeLabel[entry.type]}</span>
		<time datetime={entry.created_at}>{formatDate(entry.created_at)}</time>
	</div>

	{#if entry.type === 'image' && entry.file_path}
		<figure>
			<img src={entry.file_path} alt={entry.raw_content} loading="lazy" />
			<figcaption>{entry.raw_content}</figcaption>
		</figure>
	{:else if entry.type === 'link'}
		<a class="link" href={entry.raw_content} target="_blank" rel="noreferrer">
			<span class="host">{host}</span>
			<span class="url">{entry.raw_content}</span>
		</a>
	{:else}
		<p class="raw">{entry.raw_content}</p>
	{/if}

	<SummaryEditor bind:summary={entry.ai_summary} />
</article>

<style>
	.entry {
		padding: var(--s3);
		border: var(--border);
		border-radius: var(--radius);
		background: var(--surface);
	}

	.meta {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--s2);
	}

	.type {
		display: inline-flex;
		align-items: center;
		gap: 6px;
	}

	.raw {
		white-space: pre-wrap;
	}

	figure {
		margin: 0;
	}

	img {
		width: 100%;
		border: var(--border);
		border-radius: 2px;
	}

	figcaption {
		margin-top: var(--s1);
	}

	.link {
		display: grid;
		gap: 2px;
		padding: 12px var(--s2);
		border: var(--border);
		border-radius: var(--radius);
		text-decoration: none;
		transition: border-color var(--ease);
	}

	.link:hover {
		border-color: var(--accent);
	}

	.host {
		font-weight: var(--fw-bold);
	}

	.url {
		font-size: var(--fs-xs);
		color: var(--muted);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	@media (max-width: 600px) {
		.entry {
			padding: var(--s2);
		}
	}
</style>
