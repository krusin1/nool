<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children?: Snippet } = $props();
</script>

<header class="app-header">
	<a class="wordmark serif" href="/">Marginalia</a>
	{#if children}
		<div class="actions">{@render children()}</div>
	{/if}
</header>

<style>
	.app-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--s2);
		height: 56px;
		padding: 0 var(--s3);
		border-bottom: var(--border);
		background: var(--bg);
	}

	.wordmark {
		font-size: var(--fs-md);
		font-weight: var(--fw-bold);
		text-decoration: none;
		letter-spacing: -0.01em;
	}

	.actions {
		display: flex;
		align-items: center;
		gap: var(--s1);
	}

	@media (max-width: 600px) {
		.app-header {
			padding: 0 var(--s2);
		}
	}
</style>
