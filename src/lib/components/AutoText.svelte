<script lang="ts">
	// A textarea that grows with its content and reads like plain text until focused.
	let {
		value = $bindable(),
		placeholder = '',
		class: cls = '',
		label,
		oninput,
		onkeydown
	}: {
		value: string;
		placeholder?: string;
		class?: string;
		label?: string;
		oninput?: () => void;
		onkeydown?: (e: KeyboardEvent) => void;
	} = $props();

	let el: HTMLTextAreaElement;

	function fit() {
		el.style.height = 'auto';
		el.style.height = `${el.scrollHeight}px`;
	}

	$effect(() => {
		void value;
		fit();
	});
</script>

<textarea
	bind:this={el}
	bind:value
	class="auto {cls}"
	rows="1"
	{placeholder}
	aria-label={label ?? placeholder}
	oninput={() => oninput?.()}
	{onkeydown}
></textarea>

<style>
	.auto {
		display: block;
		width: 100%;
		padding: 0;
		border: none;
		background: transparent;
		resize: none;
		overflow: hidden;
		outline: none;
		line-height: 1.55;
	}

	.auto::placeholder {
		color: var(--muted);
	}
</style>
