<script lang="ts">
	import { onMount } from 'svelte';
	import Smartphone from '@lucide/svelte/icons/smartphone';

	type Status = { enabled: boolean; running: boolean; url: string | null; qr: string | null };
	let status = $state<Status | null>(null);
	let busy = $state(false);

	const put = async (b: object) => {
		busy = true;
		try {
			const r = await fetch('/api/phone', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(b) });
			status = await r.json();
		} finally {
			busy = false;
		}
	};

	onMount(async () => (status = await (await fetch('/api/phone')).json()));
</script>

{#if status}
	<label class="switch">
		<input type="checkbox" checked={status.enabled} disabled={busy} onchange={(e) => put({ on: e.currentTarget.checked })} />
		<span>Let my phone send to Nool</span>
	</label>

	{#if status.enabled}
		{#if status.running && status.qr}
			<div class="pair">
				<!-- QR is generated on this computer from the local address and pairing key -->
				<div class="qr" aria-label="QR code to open Nool on your phone">{@html status.qr}</div>
				<ol class="steps">
					<li>Connect your phone to the <strong>same Wi-Fi</strong> as this computer.</li>
					<li>Open the camera and point it at the code. Tap the link that appears.</li>
					<li>Pick a project and stage, then send notes, photos and voice recordings. They show up here, marked “via Phone”.</li>
				</ol>
			</div>
			<p class="label">
				Keep Nool open on this computer. If your computer asks whether Nool may accept connections, allow it on private
				networks. The phone page can only add things; it can't see or change your projects.
			</p>
			<button class="btn btn-ghost" disabled={busy} onclick={() => put({ newKey: true })}>
				<Smartphone size={14} strokeWidth={1.5} /> Unpair all phones
			</button>
		{:else if !status.url}
			<p class="label err">This computer isn't on a network right now. Connect to Wi-Fi and try again.</p>
		{:else}
			<p class="label err">Phone capture couldn't start. Something else may be using port 5174. Turn it off and on again.</p>
		{/if}
	{/if}
{/if}

<style>
	.switch {
		display: flex;
		align-items: center;
		gap: 12px;
		cursor: pointer;
		font-weight: var(--fw-bold);
	}

	.switch input {
		width: 18px;
		height: 18px;
		accent-color: var(--accent);
	}

	.pair {
		display: grid;
		grid-template-columns: 168px 1fr;
		gap: var(--s3);
		align-items: center;
		padding: var(--s2);
		border: var(--border);
		border-radius: var(--radius);
		background: var(--surface);
	}

	.qr :global(svg) {
		display: block;
		width: 168px;
		height: 168px;
	}

	.steps {
		margin: 0;
		padding-left: 1.2em;
		display: grid;
		gap: 6px;
		line-height: 1.5;
	}

	.err {
		color: #b42318;
	}

	@media (max-width: 600px) {
		.pair {
			grid-template-columns: 1fr;
			justify-items: center;
		}
	}
</style>
