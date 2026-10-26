<script lang="ts">
	import ImagePlus from '@lucide/svelte/icons/image-plus';
	import AutoText from '../AutoText.svelte';
	import { api } from '#lib/api.ts';
	import type { BlockDataMap } from '#lib/types.ts';

	let { data = $bindable(), onchange }: { data: BlockDataMap['image']; onchange: () => void } = $props();

	let input: HTMLInputElement;
	let busy = $state(false);
	let failed = $state('');

	async function replace(files: FileList | null) {
		const file = files?.[0];
		if (!file) return;
		busy = true;
		failed = '';
		try {
			data.src = await api.upload(file);
			onchange();
		} catch (e) {
			failed = (e as Error).message;
		} finally {
			busy = false;
		}
	}
</script>

<figure>
	{#if data.src}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="img" ondragover={(e) => e.preventDefault()} ondrop={(e) => (e.preventDefault(), e.stopPropagation(), replace(e.dataTransfer?.files ?? null))}>
			<img src={data.src} alt={data.caption} loading="lazy" />
			<button class="btn btn-ghost replace" onclick={() => input.click()} disabled={busy}>
				<ImagePlus size={14} strokeWidth={1.5} /> {busy ? 'Uploading…' : 'Replace'}
			</button>
		</div>
	{:else}
		<button class="empty" onclick={() => input.click()} disabled={busy}>
			<ImagePlus size={16} strokeWidth={1.5} />
			{busy ? 'Uploading…' : 'Choose an image'}
		</button>
	{/if}
	{#if failed}<p class="label err">{failed}</p>{/if}
	<AutoText bind:value={data.caption} placeholder="Caption" class="cap" oninput={onchange} />
	<input bind:this={input} class="visually-hidden" type="file" accept="image/*" onchange={(e) => replace(e.currentTarget.files)} />
</figure>

<style>
	figure {
		display: grid;
		gap: var(--s1);
		margin: 0;
	}

	.img {
		position: relative;
		border: var(--border);
	}

	.replace {
		position: absolute;
		right: 8px;
		bottom: 8px;
		background: var(--surface);
		opacity: 0;
		transition: opacity var(--ease);
	}

	.img:hover .replace,
	.replace:focus-visible {
		opacity: 1;
	}

	@media (hover: none) {
		.replace {
			opacity: 1;
		}
	}

	.img img {
		width: 100%;
	}

	.empty {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--s1);
		height: 120px;
		border: 1px dashed var(--line);
		border-radius: var(--radius);
		background: var(--bg);
		color: var(--muted);
	}

	figure :global(.cap) {
		font-size: var(--fs-xs);
		color: var(--muted);
	}

	.err {
		color: #b42318;
	}
</style>
