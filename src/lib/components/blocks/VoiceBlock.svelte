<script lang="ts">
	import { getContext } from 'svelte';
	import AudioLines from '@lucide/svelte/icons/audio-lines';
	import AutoText from '../AutoText.svelte';
	import { clock } from '#lib/recorder.svelte.ts';
	import type { BlockDataMap } from '#lib/types.ts';

	let {
		data = $bindable(),
		blockId,
		onchange
	}: { data: BlockDataMap['voice']; blockId: string; onchange: () => void } = $props();

	// Set by the desk: whether the connected AI can turn speech into text.
	const speech = getContext<() => boolean>('nool:speech') ?? (() => false);
	let busy = $state(false);
	let failed = $state('');

	async function transcribe() {
		busy = true;
		failed = '';
		try {
			const res = await fetch(`/api/blocks/${blockId}/transcribe`, { method: 'POST' });
			const j = await res.json();
			if (!res.ok) throw new Error(j.message ?? 'Could not transcribe');
			data.transcript = j.transcript;
		} catch (e) {
			failed = (e as Error).message;
		} finally {
			busy = false;
		}
	}
</script>

<div class="voice">
	<div class="player">
		<audio controls preload="metadata" src={data.src}></audio>
		{#if data.duration}<span class="label">{clock(data.duration)}</span>{/if}
	</div>
	<AutoText bind:value={data.caption} placeholder="What is this about?" oninput={onchange} />
	{#if data.transcript}
		<div class="transcript">
			<span class="label">Transcript</span>
			<AutoText bind:value={data.transcript} placeholder="Transcript" oninput={onchange} />
		</div>
	{:else if speech()}
		<button class="btn btn-ghost" onclick={transcribe} disabled={busy}>
			<AudioLines size={16} strokeWidth={1.5} />
			{busy ? 'Transcribing…' : 'Transcribe'}
		</button>
	{/if}
	{#if failed}<p class="label err">{failed}</p>{/if}
</div>

<style>
	.voice {
		display: grid;
		gap: var(--s1);
		justify-items: start;
	}

	.voice > :global(*) {
		width: 100%;
	}

	.voice > button {
		width: auto;
	}

	.player {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	audio {
		flex: 1;
		height: 36px;
		min-width: 0;
	}

	.transcript {
		display: grid;
		gap: 4px;
		padding-left: 12px;
		border-left: 2px solid var(--line);
	}

	.err {
		color: #b42318;
	}
</style>
