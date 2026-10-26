<script lang="ts">
	import Sparkles from '@lucide/svelte/icons/sparkles';
	import AskClaude from './AskClaude.svelte';
	import { api } from '#lib/api.ts';

	let {
		stageId,
		projectTitle,
		stageName,
		ai,
		empty,
		onadd
	}: { stageId: string; projectTitle: string; stageName: string; ai: boolean; empty: boolean; onadd: (text: string) => void } = $props();

	let busy = $state(false);
	let text = $state('');
	let failed = $state('');
	let open = $state(false);

	// A new stage starts fresh.
	$effect(() => {
		stageId;
		text = failed = '';
		open = false;
	});

	async function run() {
		open = true;
		failed = '';
		if (!ai) return;
		busy = true;
		try {
			text = (await api.summarize(stageId)).text;
		} catch (e) {
			failed = (e as Error).message;
		} finally {
			busy = false;
		}
	}

	function add() {
		onadd(text.trim());
		text = '';
		open = false;
	}
</script>

{#if !empty}
	<button class="btn btn-ghost trigger" onclick={run} disabled={busy}>
		<Sparkles size={16} strokeWidth={1.5} />
		{busy ? 'Summarizing…' : 'Summarize'}
	</button>
{/if}

{#if open}
	<div class="summary">
		{#if !ai}
			<p class="label">Have Claude Desktop write it, using your Claude plan. No key needed.</p>
			<AskClaude
				prompt={`Read the "${stageName}" stage of my Nool project "${projectTitle}" and add a short summary of it to that stage. Use only what's in my notes.`}
				label="Summarize with Claude Desktop"
			/>
			<p class="label">Or <a href="/connections#ai">connect an AI key</a> to summarize right here.</p>
			<div class="row"><button class="btn btn-ghost" onclick={() => (open = false)}>Close</button></div>
		{:else if busy}
			<p class="label">Reading this stage…</p>
		{:else if failed}
			<p class="label err">{failed}</p>
			<div class="row"><button class="btn btn-ghost" onclick={() => (open = false)}>Close</button></div>
		{:else if text}
			<span class="label">Summary, from your notes only. Edit before adding.</span>
			<textarea bind:value={text} rows="5"></textarea>
			<div class="row">
				<button class="btn btn-ghost" onclick={() => ((text = ''), (open = false))}>Discard</button>
				<button class="btn" onclick={run}>Try again</button>
				<button class="btn btn-primary" onclick={add} disabled={!text.trim()}>Add as note</button>
			</div>
		{/if}
	</div>
{/if}

<style>
	.summary {
		grid-column: 1 / -1;
		display: grid;
		gap: var(--s1);
		margin-top: var(--s2);
		padding: var(--s2);
		border: var(--border);
		border-radius: var(--radius);
		background: var(--surface);
	}

	textarea {
		width: 100%;
		padding: var(--s1);
		border: var(--border);
		border-radius: var(--radius);
		background: var(--bg);
		font: inherit;
		line-height: 1.55;
		resize: vertical;
	}

	.row {
		display: flex;
		justify-content: flex-end;
		gap: var(--s1);
	}

	a {
		color: var(--accent);
	}

	.err {
		color: #b42318;
	}

	.trigger {
		flex-shrink: 0;
	}

	button:disabled {
		opacity: 0.6;
	}
</style>
