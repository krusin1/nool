<script lang="ts">
	let {
		oncancel,
		onsave
	}: {
		oncancel: () => void;
		onsave: (p: { title: string; creator: string; year: string; url: string; note: string }) => void;
	} = $props();

	let p = $state({ title: '', creator: '', year: '', url: '', note: '' });
</script>

<form
	class="form"
	onsubmit={(e) => {
		e.preventDefault();
		if (p.title.trim()) onsave({ ...p });
	}}
>
	<!-- svelte-ignore a11y_autofocus -->
	<input bind:value={p.title} placeholder="Title of the work" aria-label="Title" required autofocus />
	<div class="pair">
		<input bind:value={p.creator} placeholder="By" aria-label="Creator" />
		<input bind:value={p.year} placeholder="Year" aria-label="Year" />
	</div>
	<input bind:value={p.url} placeholder="Link (optional)" aria-label="Link" type="url" />
	<input bind:value={p.note} placeholder="Why it matters to you" aria-label="Note" />
	<div class="actions">
		<button type="button" class="btn btn-ghost" onclick={oncancel}>Cancel</button>
		<button type="submit" class="btn btn-primary" disabled={!p.title.trim()}>Keep it</button>
	</div>
</form>

<style>
	.form {
		display: grid;
		gap: var(--s1);
		padding: var(--s2);
		margin-bottom: 12px;
		border: 1px solid var(--accent);
		border-radius: var(--radius);
		background: var(--surface);
	}

	.pair {
		display: grid;
		grid-template-columns: 1fr 80px;
		gap: var(--s1);
	}

	input {
		min-width: 0;
		height: 32px;
		padding: 0 var(--s1);
		border: var(--border);
		border-radius: 2px;
		background: var(--bg);
		font-size: var(--fs-xs);
		outline: none;
	}

	input:focus {
		border-color: var(--accent);
	}

	.actions {
		display: flex;
		justify-content: flex-end;
		gap: 4px;
	}

	button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
