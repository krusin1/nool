<script lang="ts">
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Eye from '@lucide/svelte/icons/eye';
	import type { Project } from '#lib/types.ts';

	let { project }: { project: Project } = $props();
</script>

<header class="ws-header">
	<div class="left">
		<a class="back" href="/" aria-label="All projects"><ArrowLeft size={16} strokeWidth={1.5} /></a>
		<div class="titles">
			<h1 class="display">{project.title}</h1>
			<p class="desc">{project.description}</p>
		</div>
	</div>
	<div class="actions">
		<a class="btn btn-ghost" href="/view/{project.id}"><Eye size={16} strokeWidth={1.5} /> <span class="hide-sm">Preview</span></a>
		<button class="btn btn-primary" disabled title="Publishing arrives in Phase 5">Publish</button>
	</div>
</header>

<style>
	.ws-header {
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
		gap: var(--s2);
		min-width: 0;
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
		min-width: 0;
	}

	h1 {
		font-size: var(--fs-lg);
		line-height: 1.15;
	}

	.desc {
		font-size: var(--fs-xs);
		color: var(--muted);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.actions {
		display: flex;
		gap: var(--s1);
		flex-shrink: 0;
	}

	button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	@media (max-width: 600px) {
		.ws-header {
			padding: var(--s1) var(--s2);
		}

		.hide-sm {
			display: none;
		}
	}
</style>
