<script lang="ts">
	import FileText from '@lucide/svelte/icons/file-text';
	import ImageIcon from '@lucide/svelte/icons/image';
	import Link from '@lucide/svelte/icons/link';
	import Mic from '@lucide/svelte/icons/mic';
	import type { EntryType } from '#lib/types.ts';

	let { type }: { type: EntryType } = $props();

	const icons = { text: FileText, image: ImageIcon, link: Link, voice: Mic };
	const Icon = $derived(icons[type]);
</script>

<Icon size={16} strokeWidth={1.5} aria-hidden="true" />
