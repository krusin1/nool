<script lang="ts">
	import type { Snippet } from 'svelte';
	import Logo from './Logo.svelte';

	let { children }: { children?: Snippet } = $props();
</script>

<header class="app-header">
	<a class="wordmark" href="/" aria-label="Nool home"><Logo size={28} /><span class="display">nool</span></a>
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
		display: inline-flex;
		align-items: center;
		gap: 10px;
		font-size: var(--fs-lg);
		font-weight: var(--fw-bold);
		text-decoration: none;
		line-height: 1;
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
