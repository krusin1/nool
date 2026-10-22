<script lang="ts">
	import Bookmark from '@lucide/svelte/icons/bookmark';
	import BookmarkCheck from '@lucide/svelte/icons/bookmark-check';
	import X from '@lucide/svelte/icons/x';
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	import SourceThumb from './SourceThumb.svelte';
	import { SOURCE_LABELS } from '#lib/stages.ts';
	import type { Precedent } from '#lib/types.ts';

	let {
		precedent = $bindable(),
		ondismiss
	}: { precedent: Precedent; ondismiss: () => void } = $props();

	let noting = $state(false);
	let draft = $state('');

	function keep() {
		if (precedent.kept) {
			precedent.kept = false;
			noting = false;
			return;
		}
		precedent.kept = true;
		draft = precedent.note;
		noting = true;
	}

	function saveNote() {
		precedent.note = draft.trim();
		noting = false;
	}
</script>

<article class="card" class:kept={precedent.kept}>
	<div class="top">
		<SourceThumb source={precedent.source} image_url={precedent.image_url} alt={precedent.title} />
		<div class="info">
			<span class="label">{SOURCE_LABELS[precedent.source]} · {precedent.year}</span>
			<a class="title" href={precedent.url} target="_blank" rel="noreferrer">
				{precedent.title}<ArrowUpRight class="ext" size={14} strokeWidth={1.5} />
			</a>
			<span class="creator label">{precedent.creator}</span>
		</div>
	</div>

	<p class="why">{precedent.snippet}</p>

	{#if precedent.kept && noting}
		<div class="note-edit">
			<!-- svelte-ignore a11y_autofocus -->
			<input
				bind:value={draft}
				placeholder="Why does this matter to you? (optional)"
				autofocus
				onkeydown={(e) => e.key === 'Enter' && saveNote()}
			/>
			<button class="btn" onclick={saveNote}>Save</button>
		</div>
	{:else if precedent.kept && precedent.note}
		<button class="note" onclick={() => ((draft = precedent.note), (noting = true))}>
			{precedent.note}
		</button>
	{/if}

	<div class="actions">
		<button class="btn keep" class:on={precedent.kept} aria-pressed={precedent.kept} onclick={keep}>
			{#if precedent.kept}
				<BookmarkCheck size={16} strokeWidth={1.5} /> Kept
			{:else}
				<Bookmark size={16} strokeWidth={1.5} /> Keep
			{/if}
		</button>
		{#if !precedent.kept}
			<button class="btn btn-ghost" onclick={ondismiss}>
				<X size={16} strokeWidth={1.5} /> Dismiss
			</button>
		{:else if !precedent.note && !noting}
			<button class="btn btn-ghost" onclick={() => ((draft = ''), (noting = true))}>Add note</button>
		{/if}
	</div>
</article>

<style>
	.card {
		padding: var(--s2);
		border: var(--border);
		border-radius: var(--radius);
		background: var(--surface);
		transition: border-color var(--ease);
	}

	.card.kept {
		border-color: var(--accent);
	}

	.top {
		display: flex;
		gap: 12px;
	}

	.info {
		display: grid;
		gap: 2px;
		min-width: 0;
	}

	.title {
		font-weight: var(--fw-bold);
		line-height: 1.35;
		text-decoration: none;
	}

	.title:hover {
		color: var(--accent);
	}

	.title :global(.ext) {
		display: inline;
		margin-left: 4px;
		vertical-align: -2px;
		color: var(--muted);
	}

	.why {
		margin-top: 12px;
		font-size: var(--fs-xs);
		line-height: 1.5;
		color: var(--muted);
	}

	.note,
	.note-edit {
		margin-top: 12px;
	}

	.note {
		display: block;
		width: 100%;
		padding: 0 0 0 12px;
		border: none;
		border-left: 2px solid var(--accent);
		background: none;
		font-style: italic;
		text-align: left;
		line-height: 1.45;
	}

	.note-edit {
		display: flex;
		gap: var(--s1);
	}

	.note-edit input {
		flex: 1;
		min-width: 0;
		height: 32px;
		padding: 0 var(--s1);
		border: var(--border);
		border-radius: var(--radius);
		background: var(--bg);
		font-size: var(--fs-xs);
		outline: none;
	}

	.note-edit input:focus {
		border-color: var(--accent);
	}

	.actions {
		display: flex;
		gap: 4px;
		margin-top: var(--s2);
	}

	.keep.on {
		border-color: var(--accent);
		background: var(--accent-soft);
		color: var(--accent);
	}
</style>
