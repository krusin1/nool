<script lang="ts">
	import { SITE_URL } from '#lib/links.ts';
	import AppHeader from '#lib/components/AppHeader.svelte';
</script>

<svelte:head><title>In the desktop app · Nool</title></svelte:head>

<AppHeader />
<main class="d">
	<h1 class="display">That part lives in the desktop app</h1>
	<p class="muted">
		The browser preview has the album, the desk, voice notes and letters. Connecting Figma, Claude, Cursor or your
		phone, the AI helper, precedent search, sharing files and backups need Nool on your computer.
	</p>
	<p><a class="btn btn-primary" href="{SITE_URL}/#get">Download Nool</a> <a class="btn btn-ghost" href="/">Back to the album</a></p>
</main>

<style>
	.d {
		max-width: 640px;
		margin: 0 auto;
		padding: var(--s8) var(--s3);
		display: grid;
		gap: var(--s2);
	}

	h1 {
		font-size: var(--fs-xl);
		line-height: 1.1;
	}

	p:last-child {
		display: flex;
		gap: var(--s1);
	}
</style>
