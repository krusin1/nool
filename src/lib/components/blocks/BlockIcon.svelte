<script lang="ts">
	import FileText from '@lucide/svelte/icons/file-text';
	import ImageIcon from '@lucide/svelte/icons/image';
	import Link from '@lucide/svelte/icons/link';
	import Quote from '@lucide/svelte/icons/quote';
	import ListChecks from '@lucide/svelte/icons/list-checks';
	import Palette from '@lucide/svelte/icons/palette';
	import BookOpen from '@lucide/svelte/icons/book-open';
	import type { BlockType } from '#lib/types.ts';

	let { type, size = 16 }: { type: BlockType; size?: number } = $props();

	const icons = { note: FileText, image: ImageIcon, link: Link, quote: Quote, todo: ListChecks, palette: Palette, spread: BookOpen };
	const Icon = $derived(icons[type]);
</script>

<Icon {size} strokeWidth={1.5} aria-hidden="true" />
