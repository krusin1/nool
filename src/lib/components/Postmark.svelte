<script lang="ts">
	import { postmarkDate } from '#lib/format.ts';

	let { date }: { date: string } = $props();

	const label = $derived(postmarkDate(date));
</script>

<svg class="postmark" viewBox="0 0 160 80" aria-label="Posted {label}" role="img">
	<g fill="none" stroke="currentColor" stroke-width="2">
		<circle cx="40" cy="40" r="32" />
		<circle cx="40" cy="40" r="25" stroke-width="1" />
		{#each [24, 34, 44, 54] as y (y)}
			<path d="M80 {y} q10 -6 20 0 t20 0 t20 0 t20 0" />
		{/each}
	</g>
	<g fill="currentColor" text-anchor="middle" font-family="var(--font-display)" font-weight="600">
		<text x="40" y="38" font-size="8.5" letter-spacing=".5">POSTED</text>
		<text x="40" y="49" font-size="7">{label}</text>
	</g>
</svg>

<style>
	.postmark {
		position: absolute;
		top: 4%;
		right: -10%;
		width: 72%;
		color: #1b1b1b;
		opacity: 0.62;
		transform: rotate(-12deg);
		pointer-events: none;
		mix-blend-mode: multiply;
	}
</style>
