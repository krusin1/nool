<script lang="ts">
	let { oncancel }: { oncancel: () => void } = $props();

	let title = $state('');
	let description = $state('');
</script>

<form class="new" onsubmit={(e) => e.preventDefault()}>
	<label>
		<span class="label">Title</span>
		<!-- svelte-ignore a11y_autofocus -->
		<input class="title serif" bind:value={title} placeholder="Untitled project" autofocus />
	</label>
	<label>
		<span class="label">One line about it</span>
		<input bind:value={description} placeholder="What are you making?" />
	</label>
	<div class="row">
		<span class="label">Saving arrives in Phase 2.</span>
		<div class="buttons">
			<button type="button" class="btn btn-ghost" onclick={oncancel}>Cancel</button>
			<button type="submit" class="btn btn-primary" disabled>Create project</button>
		</div>
	</div>
</form>

<style>
	.new {
		display: grid;
		gap: var(--s2);
		padding: var(--s3);
		margin-top: var(--s4);
		border: var(--border);
		border-radius: var(--radius);
		background: var(--surface);
	}

	label {
		display: grid;
		gap: 4px;
	}

	input {
		width: 100%;
		padding: var(--s1) 0;
		border: none;
		border-bottom: var(--border);
		background: transparent;
		outline: none;
		transition: border-color var(--ease);
	}

	input:focus {
		border-bottom-color: var(--accent);
	}

	.title {
		font-size: var(--fs-lg);
	}

	.row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: var(--s1);
	}

	.buttons {
		display: flex;
		gap: var(--s1);
	}

	button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
