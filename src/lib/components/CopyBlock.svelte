<script lang="ts">
	import Copy from '@lucide/svelte/icons/copy';
	import Check from '@lucide/svelte/icons/check';

	let { code, label }: { code: string; label: string } = $props();
	let copied = $state(false);

	async function copy() {
		try {
			await navigator.clipboard.writeText(code);
			copied = true;
			setTimeout(() => (copied = false), 1500);
		} catch {
			/* clipboard blocked: the text is still selectable */
		}
	}
</script>

<div class="copy">
	<div class="top">
		<span class="label">{label}</span>
		<button class="btn btn-ghost" onclick={copy}>
			{#if copied}<Check size={14} strokeWidth={1.5} /> Copied{:else}<Copy size={14} strokeWidth={1.5} /> Copy{/if}
		</button>
	</div>
	<pre><code>{code}</code></pre>
</div>

<style>
	.copy {
		border: var(--border);
		border-radius: var(--radius);
		background: var(--surface);
		min-width: 0;
	}

	.top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 4px 4px 4px 12px;
		border-bottom: var(--border);
	}

	pre {
		margin: 0;
		padding: 12px;
		overflow-x: auto;
		font-size: var(--fs-xs);
		line-height: 1.5;
	}
</style>
