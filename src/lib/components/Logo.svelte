<script lang="ts">
	// Nool mark: a perforated stamp with a single thread that writes an "n".
	let { size = 28, title = 'Nool' }: { size?: number; title?: string } = $props();
	const uid = $props.id();
</script>

<svg class="logo" width={size} height={size} viewBox="0 0 32 32" role="img" aria-label={title}>
	<defs>
		<mask id="perf-{uid}">
			<rect width="32" height="32" fill="white" />
			<g fill="black">
			<circle cx="4" cy="2" r="1.7" />
			<circle cx="4" cy="30" r="1.7" />
			<circle cx="2" cy="4" r="1.7" />
			<circle cx="30" cy="4" r="1.7" />
			<circle cx="8" cy="2" r="1.7" />
			<circle cx="8" cy="30" r="1.7" />
			<circle cx="2" cy="8" r="1.7" />
			<circle cx="30" cy="8" r="1.7" />
			<circle cx="12" cy="2" r="1.7" />
			<circle cx="12" cy="30" r="1.7" />
			<circle cx="2" cy="12" r="1.7" />
			<circle cx="30" cy="12" r="1.7" />
			<circle cx="16" cy="2" r="1.7" />
			<circle cx="16" cy="30" r="1.7" />
			<circle cx="2" cy="16" r="1.7" />
			<circle cx="30" cy="16" r="1.7" />
			<circle cx="20" cy="2" r="1.7" />
			<circle cx="20" cy="30" r="1.7" />
			<circle cx="2" cy="20" r="1.7" />
			<circle cx="30" cy="20" r="1.7" />
			<circle cx="24" cy="2" r="1.7" />
			<circle cx="24" cy="30" r="1.7" />
			<circle cx="2" cy="24" r="1.7" />
			<circle cx="30" cy="24" r="1.7" />
			<circle cx="28" cy="2" r="1.7" />
			<circle cx="28" cy="30" r="1.7" />
			<circle cx="2" cy="28" r="1.7" />
			<circle cx="30" cy="28" r="1.7" />
			<circle cx="2" cy="2" r="1.7" />
			<circle cx="30" cy="2" r="1.7" />
			<circle cx="2" cy="30" r="1.7" />
			<circle cx="30" cy="30" r="1.7" />
			</g>
		</mask>
	</defs>
	<rect x="2" y="2" width="28" height="28" class="stamp" mask="url(#perf-{uid})" />
	<path d="M10.5 23 V14.5 C10.5 11 12.8 9.5 15.75 9.5 C18.7 9.5 21 11 21 14.5 V20 C21 22.6 22.6 24 25.5 23" class="thread" />
</svg>

<style>
	.logo {
		display: block;
		flex-shrink: 0;
	}

	.stamp {
		fill: var(--accent);
	}

	.thread {
		fill: none;
		stroke: var(--on-accent);
		stroke-width: 2.6;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
</style>
