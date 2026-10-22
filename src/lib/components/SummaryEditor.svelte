<script lang="ts">
	import Sparkles from '@lucide/svelte/icons/sparkles';
	import Pencil from '@lucide/svelte/icons/pencil';

	let { summary = $bindable() }: { summary: string } = $props();

	let editing = $state(false);
	let draft = $state('');

	function start() {
		draft = summary;
		editing = true;
	}

	function save() {
		summary = draft.trim() || summary;
		editing = false;
	}
</script>

<div class="summary">
	<div class="head">
		<span class="label tag"><Sparkles size={14} strokeWidth={1.5} /> Summary</span>
		{#if !editing}
			<button class="edit label" onclick={start} aria-label="Edit summary">
				<Pencil size={14} strokeWidth={1.5} /> Edit
			</button>
		{/if}
	</div>

	{#if editing}
		<!-- svelte-ignore a11y_autofocus -->
		<textarea bind:value={draft} rows="3" autofocus></textarea>
		<div class="actions">
			<button class="btn btn-ghost" onclick={() => (editing = false)}>Cancel</button>
			<button class="btn" onclick={save}>Save</button>
		</div>
	{:else if summary}
		<p class="text">{summary}</p>
	{:else}
		<p class="text pending label">Summary appears once AI is connected (Phase 3).</p>
	{/if}
</div>

<style>
	.summary {
		padding-top: var(--s2);
		margin-top: var(--s2);
		border-top: var(--border);
	}

	.head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 4px;
	}

	.tag,
	.edit {
		display: inline-flex;
		align-items: center;
		gap: 4px;
	}

	.edit {
		padding: 0;
		border: none;
		background: none;
		opacity: 0;
		transition:
			opacity var(--ease),
			color var(--ease);
	}

	:global(.entry:hover) .edit,
	.edit:focus-visible {
		opacity: 1;
	}

	.edit:hover {
		color: var(--text);
	}

	@media (hover: none) {
		.edit {
			opacity: 1;
		}
	}

	.text {
		font-size: var(--fs-md);
		line-height: 1.45;
	}

	.pending {
		font-size: var(--fs-xs);
	}

	textarea {
		width: 100%;
		padding: var(--s1);
		border: var(--border);
		border-radius: var(--radius);
		background: var(--bg);
		font-family: var(--font-ui);
		font-size: var(--fs-md);
		line-height: 1.45;
		resize: vertical;
		outline: none;
	}

	textarea:focus {
		border-color: var(--accent);
	}

	.actions {
		display: flex;
		justify-content: flex-end;
		gap: var(--s1);
		margin-top: var(--s1);
	}
</style>
