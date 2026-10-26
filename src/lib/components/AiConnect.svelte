<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	import { untrack } from 'svelte';

	interface Provider {
		id: string;
		name: string;
		hint: string;
		keyUrl: string | null;
		needsKey: boolean;
		needsUrl: boolean;
		defaultModel: string;
	}
	type Status = { connected: false } | { connected: true; provider: string; name: string; model: string; url: string; keyEnd: string };

	let {
		providers,
		status: initial,
		onconnected
	}: { providers: Provider[]; status: Status; onconnected?: () => void } = $props();

	let status = $state<Status>(untrack(() => initial));
	let editing = $state(untrack(() => !initial.connected));
	let pick = $state(untrack(() => (initial.connected ? initial.provider : 'anthropic')));
	let key = $state('');
	let model = $state('');
	let url = $state('');
	let busy = $state(false);
	let failed = $state('');
	let ollama = $state<string[]>([]);

	const p = $derived(providers.find((x) => x.id === pick)!);

	$effect(() => {
		if (pick !== 'ollama') return;
		fetch('/api/settings/ai')
			.then((r) => r.json())
			.then((j) => {
				ollama = j.ollama ?? [];
				if (ollama.length && !model) model = ollama[0];
			})
			.catch(() => {});
	});

	function choose(id: string) {
		pick = id;
		key = model = url = failed = '';
	}

	async function connect(e: SubmitEvent) {
		e.preventDefault();
		busy = true;
		failed = '';
		try {
			const res = await fetch('/api/settings/ai', {
				method: 'PUT',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ provider: pick, key, model, url })
			});
			const j = await res.json();
			if (!res.ok) throw new Error(j.message ?? 'Could not connect');
			status = j;
			editing = false;
			key = '';
			onconnected?.();
		} catch (err) {
			failed = (err as Error).message;
		} finally {
			busy = false;
		}
	}

	async function disconnect() {
		status = await (await fetch('/api/settings/ai', { method: 'DELETE' })).json();
		editing = true;
	}
</script>

{#if status.connected && !editing}
	<div class="connected">
		<Check size={16} strokeWidth={1.5} />
		<div>
			<strong>{status.name}</strong>
			<span class="label">{status.model}{status.keyEnd ? ` · key ending ${status.keyEnd}` : ''}</span>
		</div>
		<div class="row">
			<button class="btn btn-ghost" onclick={() => ((editing = true), (pick = status.connected ? status.provider : pick))}>Change</button>
			<button class="btn btn-ghost" onclick={disconnect}>Disconnect</button>
		</div>
	</div>
{:else}
	<form class="connect" onsubmit={connect}>
		<div class="providers" role="radiogroup" aria-label="AI provider">
			{#each providers as x (x.id)}
				<button type="button" role="radio" aria-checked={pick === x.id} class="provider" class:on={pick === x.id} onclick={() => choose(x.id)}>
					<span class="name">{x.name}</span>
					<span class="label">{x.hint}</span>
				</button>
			{/each}
		</div>

		<ol class="steps">
			{#if p.id === 'ollama'}
				<li>
					Install Ollama <a href={p.keyUrl} target="_blank" rel="noreferrer">from ollama.com <ArrowUpRight size={12} strokeWidth={1.5} /></a>
					and open it. No account or key needed, and nothing leaves your computer.
				</li>
				<li>Download a model once. In Ollama, pick one such as <code>llama3.2</code>.</li>
				<li>
					{#if ollama.length}Pick the model below and connect.{:else}Ollama isn't running yet. Open it, then come back here.{/if}
				</li>
			{:else if p.keyUrl}
				<li>
					<a href={p.keyUrl} target="_blank" rel="noreferrer">Open the {p.name} key page <ArrowUpRight size={12} strokeWidth={1.5} /></a>,
					and sign in. Press the button to create a new key.
					Some providers ask you to add a little credit first. You pay them directly, usually cents per use.
				</li>
				<li>Copy the key (a long line of letters and numbers), paste it below and press <strong>Connect</strong>.</li>
			{:else}
				<li>Enter the service's address (it usually ends in <code>/v1</code>), a model name, and a key if it needs one.</li>
			{/if}
		</ol>

		{#if p.needsUrl}
			<label><span class="label">Address</span><input bind:value={url} placeholder="https://…/v1" /></label>
		{/if}
		{#if p.id !== 'ollama'}
			<label>
				<span class="label">Key{p.needsKey ? '' : ' (if needed)'}</span>
				<input type="password" bind:value={key} placeholder={status.connected && status.provider === pick ? 'Saved. Paste a new one to replace it.' : 'Paste here'} autocomplete="off" spellcheck="false" />
			</label>
		{/if}
		<label>
			<span class="label">Model</span>
			{#if p.id === 'ollama' && ollama.length}
				<select bind:value={model}>
					{#each ollama as m (m)}<option>{m}</option>{/each}
				</select>
			{:else}
				<input bind:value={model} placeholder={p.defaultModel || 'model name'} />
			{/if}
		</label>
		<span class="label">You can leave Model as it is.</span>

		{#if failed}<p class="label err">{failed}</p>{/if}
		<div class="row">
			{#if status.connected}<button type="button" class="btn btn-ghost" onclick={() => (editing = false)}>Cancel</button>{/if}
			<button class="btn btn-primary" disabled={busy}>{busy ? 'Checking…' : 'Connect'}</button>
		</div>
	</form>
{/if}

<style>
	.connected {
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: center;
		gap: 12px;
		padding: var(--s2);
		border: 1px solid var(--accent);
		border-radius: var(--radius);
		color: var(--accent);
	}

	.connected div {
		display: grid;
		color: var(--text);
	}

	.connect {
		display: grid;
		gap: 12px;
	}

	.providers {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--s1);
	}

	.provider {
		display: grid;
		gap: 2px;
		padding: 12px;
		text-align: left;
		border: var(--border);
		border-radius: var(--radius);
		background: var(--surface);
		cursor: pointer;
		transition: border-color var(--ease);
	}

	.provider.on {
		border-color: var(--accent);
	}

	.name {
		font-weight: var(--fw-bold);
	}

	label {
		display: grid;
		gap: 4px;
	}

	input,
	select {
		width: 100%;
		padding: var(--s1);
		border: var(--border);
		border-radius: var(--radius);
		background: var(--surface);
		font: inherit;
	}

	.steps {
		margin: 0;
		padding-left: 1.2em;
		display: grid;
		gap: 4px;
	}

	a {
		color: var(--accent);
	}

	code {
		font-size: var(--fs-xs);
	}

	.row {
		display: flex;
		justify-content: flex-end;
		gap: var(--s1);
	}

	.err {
		color: #b42318;
	}

	@media (max-width: 600px) {
		.providers {
			grid-template-columns: repeat(2, 1fr);
		}
	}
</style>
