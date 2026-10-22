<script lang="ts">
	import ImageIcon from '@lucide/svelte/icons/image';
	import Mic from '@lucide/svelte/icons/mic';
	import CornerDownLeft from '@lucide/svelte/icons/corner-down-left';
	import type { EntryType } from '#lib/types.ts';

	let {
		stageLabel,
		onadd
	}: {
		stageLabel: string;
		onadd: (entry: { type: EntryType; raw_content: string; file_path: string | null }) => void;
	} = $props();

	let text = $state('');
	let dragging = $state(false);
	let fileInput: HTMLInputElement;

	const isLink = (s: string) => /^https?:\/\/\S+$/.test(s.trim());

	function submit() {
		const value = text.trim();
		if (!value) return;
		onadd({ type: isLink(value) ? 'link' : 'text', raw_content: value, file_path: null });
		text = '';
	}

	function addFiles(files: FileList | null | undefined) {
		if (!files) return;
		for (const file of Array.from(files)) {
			if (!file.type.startsWith('image/')) continue;
			onadd({ type: 'image', raw_content: file.name, file_path: URL.createObjectURL(file) });
		}
	}

	function onkeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
			e.preventDefault();
			submit();
		}
	}

	function ondrop(e: DragEvent) {
		e.preventDefault();
		dragging = false;
		const dropped = e.dataTransfer?.getData('text/plain');
		if (e.dataTransfer?.files.length) addFiles(e.dataTransfer.files);
		else if (dropped) text = dropped;
	}
</script>

<div
	class="drop"
	class:dragging
	role="group"
	aria-label="Add to {stageLabel}"
	ondragover={(e) => {
		e.preventDefault();
		dragging = true;
	}}
	ondragleave={() => (dragging = false)}
	{ondrop}
>
	<textarea
		bind:value={text}
		{onkeydown}
		rows="2"
		placeholder="Add to {stageLabel}: write a note, paste a link, or drop an image"
	></textarea>
	<div class="bar">
		<div class="tools">
			<button class="btn btn-ghost" type="button" onclick={() => fileInput.click()}>
				<ImageIcon size={16} strokeWidth={1.5} /> Image
			</button>
			<button class="btn btn-ghost" type="button" disabled title="Voice notes arrive in a later phase">
				<Mic size={16} strokeWidth={1.5} /> Voice
			</button>
		</div>
		<button class="btn btn-primary" type="button" onclick={submit} disabled={!text.trim()}>
			Add entry <CornerDownLeft size={14} strokeWidth={1.5} />
		</button>
	</div>
	<input
		bind:this={fileInput}
		class="visually-hidden"
		type="file"
		accept="image/*"
		multiple
		onchange={(e) => addFiles(e.currentTarget.files)}
	/>
</div>

<style>
	.drop {
		border: 1px dashed var(--line);
		border-radius: var(--radius);
		background: var(--surface);
		transition:
			border-color var(--ease),
			background var(--ease);
	}

	.drop:focus-within {
		border-style: solid;
		border-color: var(--muted);
	}

	.drop.dragging {
		border-color: var(--accent);
		border-style: solid;
		background: var(--accent-soft);
	}

	textarea {
		display: block;
		width: 100%;
		min-height: 64px;
		padding: var(--s2);
		border: none;
		background: transparent;
		resize: vertical;
		outline: none;
		line-height: 1.5;
	}

	textarea::placeholder {
		color: var(--muted);
	}

	.bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--s1);
		padding: var(--s1);
		border-top: var(--border);
	}

	.tools {
		display: flex;
		gap: 4px;
	}

	button:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}
</style>
