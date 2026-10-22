<script lang="ts">
	import '@fontsource/hanken-grotesk/400.css';
	import '@fontsource/hanken-grotesk/400-italic.css';
	import '@fontsource/hanken-grotesk/600.css';
	import '@fontsource/space-grotesk/400.css';
	import '@fontsource/space-grotesk/600.css';
	import '../app.css';
	import favicon from '#lib/assets/nool-favicon.svg';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Nool</title>
</svelte:head>

{@render children()}
