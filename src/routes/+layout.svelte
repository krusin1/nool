<script lang="ts">
	import '@fontsource/hanken-grotesk/400.css';
	import '@fontsource/hanken-grotesk/400-italic.css';
	import '@fontsource/hanken-grotesk/600.css';
	import '@fontsource/space-grotesk/400.css';
	import '@fontsource/space-grotesk/600.css';
	import '../app.css';
	import favicon from '#lib/assets/nool-favicon.svg';
	import type { LayoutProps } from './$types';

	let { children, data }: LayoutProps = $props();

	// In the desktop app, web links open in the system browser instead of inside Nool.
	function onclick(e: MouseEvent) {
		if (!data.desktop || e.defaultPrevented) return;
		const a = (e.target as HTMLElement).closest('a');
		if (!a?.href || new URL(a.href).origin === location.origin) return;
		if (!/^https?:/.test(a.href)) return;
		e.preventDefault();
		fetch('/api/open', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ url: a.href })
		});
	}
</script>

<svelte:document {onclick} />

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Nool</title>
</svelte:head>

{@render children()}
