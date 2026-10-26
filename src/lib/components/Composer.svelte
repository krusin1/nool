<script lang="ts">
	// Quick capture at the foot of a stage. Type and press Enter for a note; paste a
	// link for a link; paste or drop images. Other block types are one click away.
	import CornerDownLeft from '@lucide/svelte/icons/corner-down-left';
	import BlockIcon from './blocks/BlockIcon.svelte';
	import AutoText from './AutoText.svelte';
	import { api } from '#lib/api.ts';
	import { BLOCK_LABELS, emptyData, isUrl } from '#lib/blocks.ts';
	import type { BlockDataMap, BlockType } from '#lib/types.ts';

	let {
		stageName,
		onadd
	}: {
		stageName: string;
		onadd: <T extends BlockType>(type: T, data: BlockDataMap[T]) => Promise<void>;
	} = $props();

	let text = $state('');
	let dragging = $state(false);
	let busy = $state(false);
	let failed = $state('');
	let fileInput: HTMLInputElement;

	const QUICK: BlockType[] = ['image', 'quote', 'todo', 'palette', 'spread'];

	async function submit() {
		const value = text.trim();
		if (!value) return;
		text = '';
		if (isUrl(value)) await onadd('link', { url: value, note: '' });
		else await onadd('note', { text: value });
	}

	async function images(files: Iterable<File>) {
		const list = [...files].filter((f) => f.type.startsWith('image/'));
		if (!list.length) return;
		busy = true;
		failed = '';
		try {
			for (const f of list) await onadd('image', { src: await api.upload(f), caption: '' });
		} catch (e) {
			failed = (e as Error).message;
		} finally {
			busy = false;
		}
	}

	function quick(type: BlockType) {
		if (type === 'image') fileInput.click();
		else onadd(type, emptyData(type));
	}

	function onkeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
			e.preventDefault();
			submit();
		}
	}

	function onpaste(e: ClipboardEvent) {
		const files = [...(e.clipboardData?.files ?? [])];
		if (files.length) {
			e.preventDefault();
			images(files);
		}
	}

	function ondrop(e: DragEvent) {
		e.preventDefault();
		dragging = false;
		if (e.dataTransfer?.files.length) images(e.dataTransfer.files);
		else {
			const dropped = e.dataTransfer?.getData('text/plain');
			if (dropped) text = dropped;
		}
	}
</script>

<div
	class="composer"
	class:dragging
	role="group"
	aria-label="Add to {stageName}"
	ondragover={(e) => {
		e.preventDefault();
		dragging = true;
	}}
	ondragleave={() => (dragging = false)}
	{ondrop}
	{onpaste}
>
	<div class="write">
		<AutoText bind:value={text} {onkeydown} placeholder="Add to {stageName}: a note, a link, or paste an image" />
		<button class="send" onclick={submit} disabled={!text.trim()} aria-label="Add note">
			<CornerDownLeft size={16} strokeWidth={1.5} />
		</button>
	</div>
	<div class="bar">
		{#each QUICK as type (type)}
			<button class="btn btn-ghost" onclick={() => quick(type)} disabled={busy && type === 'image'}>
				<BlockIcon {type} />
				{type === 'image' && busy ? 'Uploading…' : BLOCK_LABELS[type]}
			</button>
		{/each}
		<span class="hint label">Enter to add · Shift+Enter for a new line</span>
	</div>
	{#if failed}<p class="label err">{failed}</p>{/if}
	<input
		bind:this={fileInput}
		class="visually-hidden"
		type="file"
		accept="image/*"
		multiple
		onchange={(e) => images(e.currentTarget.files ?? [])}
	/>
</div>

<style>
	.composer {
		border: 1px dashed var(--line);
		border-radius: var(--radius);
		background: var(--surface);
		transition:
			border-color var(--ease),
			background var(--ease);
	}

	.composer:focus-within {
		border-style: solid;
		border-color: var(--muted);
	}

	.dragging {
		border-style: solid;
		border-color: var(--accent);
		background: var(--accent-soft);
	}

	.write {
		display: flex;
		align-items: flex-start;
		gap: var(--s1);
		padding: 12px var(--s2);
	}

	.send {
		display: grid;
		place-items: center;
		width: 28px;
		height: 28px;
		flex-shrink: 0;
		border: none;
		border-radius: 2px;
		background: var(--accent);
		color: var(--on-accent);
		transition: opacity var(--ease);
	}

	.send:disabled {
		opacity: 0.25;
		cursor: default;
	}

	.bar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 2px;
		padding: 4px var(--s1);
		border-top: var(--border);
	}

	.hint {
		margin-left: auto;
		padding-right: var(--s1);
	}

	.err {
		padding: 0 var(--s2) var(--s1);
		color: #b42318;
	}

	@media (max-width: 600px) {
		.hint {
			display: none;
		}
	}
</style>
