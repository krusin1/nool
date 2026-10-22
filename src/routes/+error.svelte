<script lang="ts">
	import { page } from '$app/state';
	import AppHeader from '#lib/components/AppHeader.svelte';
</script>

<AppHeader />
<main class="err">
	<span class="label">{page.status}</span>
	<h1 class="serif">{page.error?.message ?? 'Something went wrong'}</h1>
	<a class="btn" href="/">Back to projects</a>
</main>

<style>
	.err {
		display: grid;
		gap: var(--s2);
		justify-items: start;
		max-width: 680px;
		margin: 0 auto;
		padding: var(--s10) var(--s3);
	}

	h1 {
		font-size: var(--fs-xl);
		line-height: 1.1;
	}
</style>
