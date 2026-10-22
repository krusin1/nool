<script lang="ts">
	import type { Stage } from '#lib/stages.ts';
	import type { Entry } from '#lib/types.ts';

	let { stage, index, entries }: { stage: Stage; index: number; entries: Entry[] } = $props();

	const host = (url: string) => new URL(url).host.replace(/^www\./, '');
</script>

<section class="stage" id={stage.id}>
	<header>
		<span class="num label">{String(index + 1).padStart(2, '0')}</span>
		<h2 class="serif">{stage.label}</h2>
	</header>

	<div class="body">
		{#each entries as entry (entry.id)}
			{#if entry.type === 'image' && entry.file_path}
				<figure>
					<img src={entry.file_path} alt={entry.raw_content} loading="lazy" />
					<figcaption class="label">{entry.ai_summary || entry.raw_content}</figcaption>
				</figure>
			{:else}
				<p class="para serif">
					{entry.ai_summary || entry.raw_content}
					{#if entry.type === 'link'}
						<a class="src label" href={entry.raw_content} target="_blank" rel="noreferrer">{host(entry.raw_content)}</a>
					{/if}
				</p>
			{/if}
		{/each}
	</div>
</section>

<style>
	.stage {
		padding-top: var(--s5);
		margin-top: var(--s5);
		border-top: var(--border);
	}

	header {
		display: flex;
		align-items: baseline;
		gap: var(--s2);
		margin-bottom: var(--s3);
	}

	.num {
		font-variant-numeric: tabular-nums;
	}

	h2 {
		font-size: var(--fs-lg);
		font-weight: var(--fw-bold);
	}

	.body {
		display: grid;
		gap: var(--s3);
	}

	.para {
		font-size: var(--fs-md);
		line-height: 1.6;
	}

	.src {
		margin-left: 4px;
		font-family: var(--font-ui);
		text-decoration-color: var(--line);
		text-underline-offset: 3px;
	}

	.src:hover {
		color: var(--accent);
	}

	figure {
		margin: var(--s1) 0;
	}

	img {
		width: 100%;
		border: var(--border);
	}

	figcaption {
		margin-top: var(--s1);
	}
</style>
