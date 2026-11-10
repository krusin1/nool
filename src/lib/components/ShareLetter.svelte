<script lang="ts">
	import Share from '@lucide/svelte/icons/share';
	import FileCode from '@lucide/svelte/icons/file-code';
	import FolderArchive from '@lucide/svelte/icons/folder-archive';
	import Printer from '@lucide/svelte/icons/printer';

	let { id, desktop }: { id: string; desktop: boolean } = $props();

	let open = $state(false);
	let busy = $state('');
	let note = $state('');
	let root: HTMLElement;

	const OPTIONS = [
		{ f: 'html', icon: FileCode, name: 'Web page', hint: 'One .html file with images and fonts inside. Email it or upload it anywhere.' },
		{ f: 'zip', icon: FolderArchive, name: 'Website folder', hint: 'A .zip with index.html and the images, for Netlify, GitHub Pages or your portfolio.' },
		{ f: 'pdf', icon: Printer, name: 'PDF', hint: 'Opens the print dialog. Choose Save as PDF.' }
	] as const;

	async function share(f: (typeof OPTIONS)[number]['f']) {
		note = '';
		if (!desktop) {
			open = false;
			if (f === 'pdf') return window.print();
			const a = document.createElement('a');
			a.href = `/api/projects/${id}/export?format=${f}`;
			a.download = '';
			a.click();
			return;
		}
		busy = f;
		try {
			const res = await fetch(`/api/projects/${id}/export`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ format: f }) });
			const j = await res.json();
			if (!res.ok) throw new Error(j.message ?? 'Export failed');
			note = f === 'pdf' ? 'Opened in your browser. Choose Save as PDF in the print dialog.' : `Saved ${j.name} to your Downloads.`;
		} catch (e) {
			note = (e as Error).message;
		} finally {
			busy = '';
		}
	}
</script>

<svelte:window onclick={(e) => open && !root.contains(e.target as Node) && (open = false)} onkeydown={(e) => e.key === 'Escape' && (open = false)} />

<div class="share" bind:this={root}>
	<button class="btn" aria-expanded={open} aria-haspopup="menu" onclick={() => ((open = !open), (note = ''))}>
		<Share size={16} strokeWidth={1.5} /> Share
	</button>
	{#if open}
		<div class="menu" role="menu">
			{#each OPTIONS as o (o.f)}
				<button role="menuitem" class="item" disabled={!!busy} onclick={() => share(o.f)}>
					<o.icon size={16} strokeWidth={1.5} />
					<span><strong>{busy === o.f ? 'Saving…' : o.name}</strong><span class="label">{o.hint}</span></span>
				</button>
			{/each}
			{#if note}<p class="label note" role="status">{note}</p>{/if}
		</div>
	{/if}
</div>

<style>
	.share {
		position: relative;
	}

	.menu {
		position: absolute;
		right: 0;
		top: calc(100% + 6px);
		z-index: 5;
		width: 320px;
		padding: 6px;
		border: var(--border);
		border-radius: var(--radius);
		background: var(--surface);
	}

	.item {
		display: grid;
		grid-template-columns: 16px 1fr;
		gap: 12px;
		width: 100%;
		padding: 10px;
		border: none;
		border-radius: var(--radius);
		background: none;
		color: var(--text);
		text-align: left;
		cursor: pointer;
		transition: background var(--ease);
	}

	.item:hover {
		background: var(--bg);
	}

	.item span {
		display: grid;
		gap: 2px;
		line-height: 1.4;
	}

	.item :global(svg) {
		margin-top: 2px;
	}

	.note {
		padding: 8px 10px 4px;
		border-top: var(--border);
		line-height: 1.5;
	}

	@media print {
		.share {
			display: none;
		}
	}
</style>
