<script lang="ts">
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Mail from '@lucide/svelte/icons/mail';
	import Trash from '@lucide/svelte/icons/trash';
	import Logo from './Logo.svelte';
	import SaveStatus from './SaveStatus.svelte';
	import type { Project } from '#lib/types.ts';

	let {
		project = $bindable(),
		onedit,
		onpost,
		onrecall,
		ondelete
	}: {
		project: Project;
		onedit: () => void;
		onpost: () => void;
		onrecall: () => void;
		ondelete: () => void;
	} = $props();
</script>

<header class="desk-header">
	<div class="left">
		<a class="back" href="/" aria-label="Back to album"><ArrowLeft size={16} strokeWidth={1.5} /></a>
		<a class="logo" href="/" aria-label="Nool"><Logo size={22} /></a>
		<div class="titles">
			<input class="title display" bind:value={project.title} oninput={onedit} aria-label="Project title" />
			<input class="desc" bind:value={project.description} oninput={onedit} placeholder="One line about it" aria-label="Description" />
		</div>
	</div>
	<div class="actions">
		<SaveStatus />
		<button class="btn btn-ghost icon" onclick={ondelete} aria-label="Delete project" title="Delete project"><Trash size={16} strokeWidth={1.5} /></button>
		<a class="btn btn-ghost" href="/view/{project.id}"><Mail size={16} strokeWidth={1.5} /> <span class="hide-sm">Letter</span></a>
		{#if project.posted_at}
			<button class="btn" onclick={onrecall} title="Take the letter back and keep working">Recall</button>
		{:else}
			<button class="btn btn-primary" onclick={onpost}>Post</button>
		{/if}
	</div>
</header>

<style>
	.desk-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--s2);
		min-height: 64px;
		padding: var(--s1) var(--s3);
		border-bottom: var(--border);
		background: var(--bg);
	}

	.left {
		display: flex;
		align-items: center;
		gap: 12px;
		min-width: 0;
		flex: 1;
	}

	.back {
		display: grid;
		place-items: center;
		width: 32px;
		height: 32px;
		flex-shrink: 0;
		border: var(--border);
		border-radius: var(--radius);
		color: var(--muted);
		transition:
			color var(--ease),
			border-color var(--ease);
	}

	.back:hover {
		color: var(--text);
		border-color: var(--muted);
	}

	.titles {
		display: grid;
		min-width: 0;
		flex: 1;
	}

	input {
		min-width: 0;
		padding: 0;
		border: none;
		border-bottom: 1px solid transparent;
		background: transparent;
		outline: none;
		transition: border-color var(--ease);
	}

	input:hover,
	input:focus {
		border-bottom-color: var(--line);
	}

	.title {
		font-size: var(--fs-lg);
		font-weight: var(--fw-bold);
		line-height: 1.2;
	}

	.desc {
		font-size: var(--fs-xs);
		color: var(--muted);
	}

	.actions {
		display: flex;
		align-items: center;
		gap: var(--s1);
		flex-shrink: 0;
	}

	.icon {
		padding: 0 8px;
	}

	@media (max-width: 600px) {
		.desk-header {
			padding: var(--s1) var(--s2);
		}

		.logo,
		.hide-sm,
		.actions :global(.status) {
			display: none;
		}
	}
</style>
