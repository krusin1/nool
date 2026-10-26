<script lang="ts">
	import Download from '@lucide/svelte/icons/download';
	import Upload from '@lucide/svelte/icons/upload';
	import CloudUpload from '@lucide/svelte/icons/cloud-upload';
	import { invalidateAll } from '$app/navigation';
	import { untrack } from 'svelte';
	import AppHeader from '#lib/components/AppHeader.svelte';
	import { formatDate } from '#lib/format.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	type Drive = PageProps['data']['drive'] & { backups?: { id: string; name: string; createdTime: string; size: number }[] };
	let drive = $state<Drive>(untrack(() => data.drive));
	let busy = $state('');
	let message = $state('');
	let failed = $state(false);
	let fileInput: HTMLInputElement;

	const say = (text: string, err = false) => ((message = text), (failed = err));
	const mb = (n: number) => `${(n / 1024 / 1024).toFixed(1)} MB`;

	async function call(url: string, init?: RequestInit) {
		const res = await fetch(url, init);
		const json = await res.json().catch(() => ({}));
		if (!res.ok) throw new Error(json.message ?? 'Something went wrong');
		return json;
	}

	const post = (url: string, body: unknown) =>
		call(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });

	async function refresh() {
		drive = await call('/api/backup/google');
	}

	$effect(() => {
		if (drive.connected) refresh().catch(() => {});
	});

	async function restoreFile(files: FileList | null) {
		const file = files?.[0];
		if (!file) return;
		if (!confirm('Restore this backup? It replaces every project on this computer. A copy of your current data is saved first.')) return;
		busy = 'restore';
		try {
			const form = new FormData();
			form.append('file', file);
			const r = await call('/api/backup', { method: 'POST', body: form });
			say(`Restored ${r.projects} project${r.projects === 1 ? '' : 's'}.`);
			await invalidateAll();
		} catch (e) {
			say((e as Error).message, true);
		} finally {
			busy = '';
			fileInput.value = '';
		}
	}

	async function connect() {
		busy = 'connect';
		try {
			const r = await post('/api/backup/google', { action: 'connect' });
			if (!r.opened) window.open(r.url, '_blank', 'noopener');
			say('Finish signing in to Google in your browser. This page updates when you are connected.');
			for (let i = 0; i < 90 && !drive.connected; i++) {
				await new Promise((r) => setTimeout(r, 2000));
				drive = { ...drive, ...(await call('/api/backup/google')) };
			}
			if (drive.connected) say(`Connected${drive.email ? ` as ${drive.email}` : ''}.`);
		} catch (e) {
			say((e as Error).message, true);
		} finally {
			busy = '';
		}
	}

	async function backupNow() {
		busy = 'backup';
		try {
			await post('/api/backup/google', { action: 'backup' });
			await refresh();
			say('Backed up to Google Drive.');
		} catch (e) {
			say((e as Error).message, true);
		} finally {
			busy = '';
		}
	}

	async function restoreDrive(id: string, name: string) {
		if (!confirm(`Restore ${name}? It replaces every project on this computer. A copy of your current data is saved first.`)) return;
		busy = id;
		try {
			const r = await post('/api/backup/google/restore', { id });
			say(`Restored ${r.projects} project${r.projects === 1 ? '' : 's'}.`);
			await invalidateAll();
		} catch (e) {
			say((e as Error).message, true);
		} finally {
			busy = '';
		}
	}

	async function toggleAuto(on: boolean) {
		drive = { ...drive, ...(await post('/api/backup/google', { action: 'auto', on })) };
	}

	async function disconnect() {
		if (!confirm('Disconnect Google Drive? Backups already in Drive stay there.')) return;
		await call('/api/backup/google', { method: 'DELETE' });
		drive = { ...drive, connected: false, email: null, backups: [] };
		say('Disconnected.');
	}
</script>

<svelte:head>
	<title>Backups · Nool</title>
</svelte:head>

<AppHeader />

<main class="page">
	<header class="intro">
		<h1 class="display">Backups</h1>
		<p class="muted">
			Everything you make in Nool stays on this computer. Nothing is sent to a Nool server, because there isn't one.
			Back up to a file or to your own Google Drive so you don't lose work.
		</p>
		<p class="label">Stored in <code>{data.dataDir}</code></p>
	</header>

	{#if message}<p class="message" class:failed role="status">{message}</p>{/if}

	<section>
		<h2 class="display">Backup file</h2>
		<p class="muted">One file with every project and image. Keep it anywhere, or move it to another computer.</p>
		<div class="row">
			<a class="btn btn-primary" href="/api/backup" download><Download size={16} strokeWidth={1.5} /> Save backup file</a>
			<button class="btn" onclick={() => fileInput.click()} disabled={busy === 'restore'}>
				<Upload size={16} strokeWidth={1.5} /> {busy === 'restore' ? 'Restoring…' : 'Restore from file'}
			</button>
		</div>
		<input bind:this={fileInput} class="visually-hidden" type="file" accept=".nool" onchange={(e) => restoreFile(e.currentTarget.files)} />
	</section>

	<section>
		<h2 class="display">Google Drive</h2>
		{#if !drive.configured}
			<p class="muted">Google Drive backup isn't set up in this copy of Nool. Use a backup file instead.</p>
		{:else if !drive.connected}
			<p class="muted">
				Nool can only see the backups it creates, in a folder called “Nool backups”. It can't read anything else in
				your Drive.
			</p>
			<div class="row">
				<button class="btn btn-primary" onclick={connect} disabled={busy === 'connect'}>
					<CloudUpload size={16} strokeWidth={1.5} /> {busy === 'connect' ? 'Waiting for Google…' : 'Connect Google Drive'}
				</button>
			</div>
		{:else}
			<p class="muted">
				Connected{drive.email ? ` as ${drive.email}` : ''}.
				{drive.last ? `Last backup ${formatDate(drive.last)}.` : 'No backups yet.'}
			</p>
			<div class="row">
				<button class="btn btn-primary" onclick={backupNow} disabled={busy === 'backup'}>
					<CloudUpload size={16} strokeWidth={1.5} /> {busy === 'backup' ? 'Backing up…' : 'Back up now'}
				</button>
				<label class="check">
					<input type="checkbox" checked={drive.auto} onchange={(e) => toggleAuto(e.currentTarget.checked)} />
					Back up once a day while Nool is open
				</label>
			</div>
			{#if drive.backups?.length}
				<ul class="list">
					{#each drive.backups as b (b.id)}
						<li>
							<span>{b.name}</span>
							<span class="label">{formatDate(b.createdTime)} · {mb(b.size)}</span>
							<button class="btn btn-ghost" onclick={() => restoreDrive(b.id, b.name)} disabled={busy === b.id}>
								{busy === b.id ? 'Restoring…' : 'Restore'}
							</button>
						</li>
					{/each}
				</ul>
				<p class="label">The 10 most recent backups are kept.</p>
			{/if}
			<button class="btn btn-ghost disconnect" onclick={disconnect}>Disconnect Google Drive</button>
		{/if}
	</section>
</main>

<style>
	.page {
		max-width: 760px;
		margin: 0 auto;
		padding: var(--s8) var(--s3) var(--s10);
		display: grid;
		gap: var(--s6);
	}

	.intro {
		display: grid;
		gap: var(--s1);
		padding-bottom: var(--s3);
		border-bottom: 1px solid var(--text);
	}

	h1 {
		font-size: var(--fs-xl);
		line-height: 1.1;
	}

	.intro p {
		max-width: 60ch;
	}

	code {
		font-size: var(--fs-xs);
		word-break: break-all;
	}

	section {
		display: grid;
		gap: 12px;
	}

	h2 {
		font-size: var(--fs-md);
	}

	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--s1) var(--s2);
	}

	.check {
		display: inline-flex;
		align-items: center;
		gap: var(--s1);
		font-size: var(--fs-xs);
	}

	.check input {
		accent-color: var(--accent);
	}

	.list {
		list-style: none;
		margin: 0;
		padding: 0;
		border-top: var(--border);
	}

	.list li {
		display: grid;
		grid-template-columns: 1fr auto auto;
		align-items: center;
		gap: var(--s2);
		padding: var(--s1) 0;
		border-bottom: var(--border);
		font-size: var(--fs-xs);
	}

	.message {
		padding: 12px var(--s2);
		border: 1px solid var(--accent);
		border-radius: var(--radius);
		background: var(--accent-soft);
	}

	.message.failed {
		border-color: #b42318;
		background: transparent;
		color: #b42318;
	}

	.disconnect {
		justify-self: start;
	}

	button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	@media (max-width: 600px) {
		.page {
			padding: var(--s5) var(--s2) var(--s8);
		}

		.list li {
			grid-template-columns: 1fr auto;
		}

		.list li .label {
			display: none;
		}
	}
</style>
