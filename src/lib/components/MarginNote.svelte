<script lang="ts">
	import type { Precedent } from '#lib/types.ts';

	let { precedent, ref }: { precedent: Precedent; ref: number } = $props();
</script>

<a class="note" href="#ref-{ref}">
	<span class="ref">{ref}</span>
	<span class="body">
		<span class="title">{precedent.title}</span>
		<span class="by">{precedent.creator}</span>
		{#if precedent.note}
			<span class="why serif">{precedent.note}</span>
		{/if}
	</span>
</a>

<style>
	.note {
		display: grid;
		grid-template-columns: 24px 1fr;
		gap: var(--s1);
		padding: 12px 0;
		border-top: var(--border);
		text-decoration: none;
		font-size: var(--fs-xs);
		line-height: 1.45;
	}

	.ref {
		color: var(--accent);
		font-weight: var(--fw-bold);
		font-variant-numeric: tabular-nums;
	}

	.body {
		display: grid;
		gap: 2px;
	}

	.title {
		font-weight: var(--fw-bold);
		transition: color var(--ease);
	}

	.note:hover .title {
		color: var(--accent);
	}

	.by {
		color: var(--muted);
	}

	.why {
		margin-top: 4px;
		font-size: var(--fs-sm);
		font-style: italic;
	}
</style>
