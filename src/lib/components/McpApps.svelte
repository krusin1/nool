<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import { untrack } from 'svelte';

	type App = { id: string; name: string; path: string; found: boolean; installed: boolean; restart: string };
	let { apps: initial }: { apps: App[] } = $props();

	let apps = $state<App[]>(untrack(() => initial));
	let busy = $state('');
	let message = $state<Record<string, string>>({});

	async function call(method: 'POST' | 'DELETE', id: string) {
		busy = id;
		message[id] = '';
		try {
			const res = await fetch('/api/mcp', { method, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ app: id }) });
			const j = await res.json();
			if (!res.ok) throw new Error(j.message);
			const app = apps.find((a) => a.id === id)!;
			app.installed = method === 'POST';
			app.found = true;
			message[id] = method === 'POST' ? `Added. ${app.restart}` : 'Removed.';
		} catch (e) {
			message[id] = (e as Error).message;
		} finally {
			busy = '';
		}
	}
</script>

<ul class="apps">
	{#each apps as app (app.id)}
		<li>
			<div class="info">
				<strong>{app.name}</strong>
				<span class="label">
					{#if message[app.id]}{message[app.id]}{:else if app.installed}Connected{:else if app.found}Found on this computer{:else}Not found on this computer{/if}
				</span>
			</div>
			{#if app.installed}
				<span class="ok"><Check size={16} strokeWidth={1.5} /></span>
				<button class="btn btn-ghost" disabled={busy === app.id} onclick={() => call('DELETE', app.id)}>Remove</button>
			{:else}
				<span></span>
				<button class="btn" class:btn-primary={app.found} disabled={busy === app.id} onclick={() => call('POST', app.id)}>Add Nool</button>
			{/if}
		</li>
	{/each}
</ul>

<style>
	.apps {
		list-style: none;
		margin: 0;
		padding: 0;
		border-top: var(--border);
	}

	li {
		display: grid;
		grid-template-columns: 1fr auto auto;
		align-items: center;
		gap: 12px;
		padding: 12px 0;
		border-bottom: var(--border);
	}

	.info {
		display: grid;
		gap: 2px;
	}

	.ok {
		color: var(--accent);
		display: inline-flex;
	}

	button:disabled {
		opacity: 0.6;
	}
</style>
