<script lang="ts">
	import { goto } from '$app/navigation';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import Logo from '#lib/components/Logo.svelte';
	import AiConnect from '#lib/components/AiConnect.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let step = $state(0);
	let connected = $state(false);
	const STEPS = ['Welcome', 'AI, if you want it', 'Ready'];

	async function finish(to = '/') {
		await fetch('/api/settings/welcomed', { method: 'POST' });
		await goto(to);
	}
</script>

<svelte:head>
	<title>Welcome · Nool</title>
</svelte:head>

<main class="welcome">
	<ol class="progress" aria-label="Setup steps">
		{#each STEPS as s, i (s)}
			<li class:on={i === step} class:done={i < step}><span class="n">{i + 1}</span> {s}</li>
		{/each}
	</ol>

	{#if step === 0}
		<section>
			<Logo size={48} />
			<h1 class="display">Welcome to Nool</h1>
			<p class="lead">
				Document a project while you make it. Drop in notes, images, links and quotes as you go, keep the works it
				builds on, and post it as a case study when you're done.
			</p>
			<ul class="points">
				<li><strong>Yours, on this computer.</strong> No account. Your projects never leave this machine unless you back them up.</li>
				<li><strong>You make the work.</strong> AI is optional and only helps document and find references, when you ask.</li>
			</ul>
			<div class="row">
				<button class="btn btn-primary" onclick={() => (step = 1)}>Get started <ArrowRight size={16} strokeWidth={1.5} /></button>
			</div>
		</section>
	{:else if step === 1}
		<section>
			<h1 class="display">Connect an AI model</h1>
			<p class="lead">
				Optional. With one connected you get two buttons: <strong>Summarize</strong> a stage from your own notes, and
				<strong>Find precedents</strong> with sharper picks. Nothing runs until you press them. Your key is stored only
				on this computer.
			</p>
			<p class="muted">Pick the one you already use. Not sure? Ollama is free and runs offline.</p>
			<AiConnect providers={data.providers} status={data.ai} onconnected={() => (connected = true)} />
			<div class="row">
				<button class="btn btn-ghost" onclick={() => (step = 0)}>Back</button>
				{#if connected || data.ai.connected}
					<button class="btn btn-primary" onclick={() => (step = 2)}>Continue <ArrowRight size={16} strokeWidth={1.5} /></button>
				{:else}
					<button class="btn" onclick={() => (step = 2)}>Skip for now</button>
				{/if}
			</div>
		</section>
	{:else}
		<section>
			<h1 class="display">You're set</h1>
			<p class="lead">
				{connected || data.ai.connected ? 'Your AI is connected.' : 'You can connect an AI any time from Connections.'}
				Your album has a few sample stamps to look around. Issue your own when you're ready.
			</p>
			<ul class="points">
				<li><strong>Working in Figma, Claude or Cursor?</strong> Connections sets them up to send work straight in, in one click each.</li>
				<li><strong>Back up</strong> to a file or your own Google Drive from Backups.</li>
			</ul>
			<div class="row">
				<button class="btn" onclick={() => finish('/connections')}>Set up apps</button>
				<button class="btn btn-primary" onclick={() => finish()}>Open my album <ArrowRight size={16} strokeWidth={1.5} /></button>
			</div>
		</section>
	{/if}
</main>

<style>
	.welcome {
		max-width: 640px;
		margin: 0 auto;
		padding: var(--s8) var(--s3) var(--s10);
	}

	.progress {
		display: flex;
		gap: var(--s3);
		list-style: none;
		margin: 0 0 var(--s6);
		padding: 0 0 var(--s2);
		border-bottom: var(--border);
		color: var(--muted);
		font-size: var(--fs-xs);
	}

	.progress li.on {
		color: var(--text);
	}

	.n {
		display: inline-grid;
		place-items: center;
		width: 20px;
		height: 20px;
		margin-right: 4px;
		border: var(--border);
		border-radius: 50%;
		font-family: var(--font-display);
	}

	.on .n {
		border-color: var(--accent);
		color: var(--accent);
	}

	.done .n {
		background: var(--accent);
		border-color: var(--accent);
		color: #fff;
	}

	section {
		display: grid;
		gap: var(--s2);
	}

	h1 {
		font-size: var(--fs-xl);
		line-height: 1.1;
		margin-top: var(--s1);
	}

	.lead {
		font-size: var(--fs-md);
		line-height: 1.5;
	}

	.points {
		margin: 0;
		padding: 0;
		list-style: none;
		display: grid;
		gap: var(--s1);
		border-top: var(--border);
	}

	.points li {
		padding: 12px 0;
		border-bottom: var(--border);
		line-height: 1.5;
	}

	.row {
		display: flex;
		justify-content: flex-end;
		gap: var(--s1);
		margin-top: var(--s2);
	}

	@media (max-width: 600px) {
		.welcome {
			padding: var(--s5) var(--s2) var(--s8);
		}

		.progress {
			gap: var(--s2);
		}
	}
</style>
