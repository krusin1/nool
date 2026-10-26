<script lang="ts">
	import { autosave } from '#lib/autosave.svelte.ts';

	const text = $derived(
		{ idle: '', saving: 'Saving…', saved: 'Saved', error: `Not saved: ${autosave.error}` }[autosave.status]
	);
</script>

<span class="status label" class:err={autosave.status === 'error'} role="status" aria-live="polite">{text}</span>

<style>
	.status {
		white-space: nowrap;
	}

	.err {
		color: #b42318;
	}
</style>
