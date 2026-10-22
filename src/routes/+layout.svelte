<script lang="ts">
	import '@fontsource-variable/inter/wght.css';
	import '@fontsource/newsreader/400.css';
	import '@fontsource/newsreader/400-italic.css';
	import '@fontsource/newsreader/600.css';
	import '../app.css';
	import favicon from '#lib/assets/favicon.svg';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Marginalia</title>
</svelte:head>

{@render children()}
