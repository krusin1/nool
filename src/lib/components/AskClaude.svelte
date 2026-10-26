<script lang="ts">
	import MessageSquare from '@lucide/svelte/icons/message-square';

	// Hand the task to the Claude desktop app: copy a ready request, open Claude, and the
	// result comes back into Nool through the Nool connection (Connections → Chat apps).
	let { prompt, label = 'Ask Claude Desktop' }: { prompt: string; label?: string } = $props();
	let done = $state(false);

	async function ask() {
		try {
			await navigator.clipboard.writeText(prompt);
		} catch {
			/* still show the text below */
		}
		const r = await fetch('/api/open', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ url: 'claude://' }) })
			.then((x) => x.json())
			.catch(() => ({ opened: false }));
		if (!r.opened) window.location.href = 'claude://';
		done = true;
	}
</script>

<button class="btn" onclick={ask}><MessageSquare size={16} strokeWidth={1.5} /> {label}</button>
{#if done}
	<div class="how">
		<p class="label">
			Copied. In Claude, paste it (Ctrl or ⌘ + V) and press Enter. When Claude is done, come back here and it shows up.
		</p>
		<p class="prompt">{prompt}</p>
		<p class="label">
			Nothing happens in Claude? Add Nool to it first: <a href="/connections">Connections → Chat apps → Add Nool</a>.
		</p>
	</div>
{/if}

<style>
	.how {
		display: grid;
		gap: 6px;
		padding: 12px;
		border: var(--border);
		border-radius: var(--radius);
		background: var(--bg);
	}

	.prompt {
		font-size: var(--fs-xs);
		font-style: italic;
	}

	.label {
		line-height: 1.5;
	}

	a {
		color: var(--accent);
	}
</style>
