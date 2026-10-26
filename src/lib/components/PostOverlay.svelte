<script lang="ts">
	// Posting: the project's stamp drops onto an envelope and gets cancelled.
	import ProjectStamp from './ProjectStamp.svelte';
	import { postmarkDate } from '#lib/format.ts';
	import type { Project } from '#lib/types.ts';

	let {
		project,
		cover,
		value,
		onclose
	}: { project: Project; cover: string | null; value: number; onclose: () => void } = $props();

	const date = $derived(postmarkDate(project.posted_at ?? new Date().toISOString()));
	let dialog: HTMLDivElement;

	$effect(() => {
		dialog.focus();
	});
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
	class="overlay"
	role="dialog"
	aria-modal="true"
	aria-labelledby="posted-title"
	tabindex="-1"
	bind:this={dialog}
	onkeydown={(e) => e.key === 'Escape' && onclose()}
>
	<div class="scene">
		<div class="envelope">
			<svg class="flap" viewBox="0 0 300 200" preserveAspectRatio="none" aria-hidden="true">
				<path d="M0 0 L150 105 L300 0" />
			</svg>
			<div class="address">
				<span class="label">Case study</span>
				<span class="to display">{project.title}</span>
				<span class="line"></span>
				<span class="line short"></span>
			</div>
			<div class="slot">
				<div class="drop">
					<ProjectStamp seed={project.id} title={project.title} image={cover} {value} date={project.created_at} />
				</div>
				<svg class="cancel" viewBox="0 0 160 80" aria-hidden="true">
					<circle cx="40" cy="40" r="30" />
					<circle cx="40" cy="40" r="23" class="thin" />
					{#each [24, 34, 44, 54] as y (y)}
						<path d="M76 {y} q10 -6 20 0 t20 0 t20 0 t20 0" />
					{/each}
					<text x="40" y="38">POSTED</text>
					<text x="40" y="49" class="small">{date}</text>
				</svg>
			</div>
		</div>

		<div class="caption">
			<h2 id="posted-title" class="display">Posted</h2>
			<p class="muted">{project.title} is now a case study you can share.</p>
			<div class="buttons">
				<button class="btn" onclick={onclose}>Back to desk</button>
				<a class="btn btn-primary" href="/view/{project.id}">Open the letter</a>
			</div>
		</div>
	</div>
</div>

<style>
	.overlay {
		position: fixed;
		inset: 0;
		z-index: 50;
		display: grid;
		place-items: center;
		padding: var(--s3);
		background: color-mix(in srgb, var(--bg) 92%, transparent);
		animation: fade 200ms ease both;
		outline: none;
	}

	.scene {
		display: grid;
		justify-items: center;
		gap: var(--s4);
		width: min(560px, 100%);
	}

	.envelope {
		position: relative;
		width: 100%;
		aspect-ratio: 3 / 2;
		background: #efe6d2;
		border: 1px solid #d8ccb1;
		border-radius: 4px;
		color: #2a261d;
		animation:
			rise 350ms cubic-bezier(0.2, 0.7, 0.2, 1) both,
			thump 180ms ease 850ms;
	}

	.flap {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}

	.flap path {
		fill: none;
		stroke: #d2c5a8;
		stroke-width: 1.5;
		vector-effect: non-scaling-stroke;
	}

	.address {
		position: absolute;
		left: 12%;
		bottom: 16%;
		display: grid;
		gap: 6px;
		width: 52%;
	}

	.address .label {
		color: #7a705b;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.to {
		font-size: var(--fs-lg);
		font-weight: var(--fw-bold);
		line-height: 1.1;
	}

	.line {
		height: 1px;
		background: #cbbd9e;
	}

	.line.short {
		width: 60%;
	}

	.slot {
		position: absolute;
		top: 8%;
		right: 6%;
		width: 22%;
	}

	.drop {
		animation: drop 520ms cubic-bezier(0.25, 0.9, 0.3, 1.25) 330ms both;
		transform-origin: center;
	}

	.cancel {
		position: absolute;
		top: 12%;
		left: -95%;
		width: 175%;
		overflow: visible;
		color: #1b1b1b;
		mix-blend-mode: multiply;
		transform: rotate(-10deg);
	}

	.cancel circle,
	.cancel path {
		fill: none;
		stroke: currentColor;
		stroke-width: 2;
		stroke-dasharray: 200;
		stroke-dashoffset: 200;
		animation: ink 500ms ease-out 900ms forwards;
	}

	.cancel .thin {
		stroke-width: 1;
	}

	.cancel text {
		fill: currentColor;
		font-family: var(--font-display);
		font-weight: 600;
		font-size: 8.5px;
		text-anchor: middle;
		letter-spacing: 0.5px;
		opacity: 0;
		animation: fade 300ms ease 1100ms forwards;
	}

	.cancel .small {
		font-size: 7px;
	}

	.caption {
		display: grid;
		justify-items: center;
		gap: var(--s1);
		text-align: center;
		animation: fade 300ms ease 1350ms both;
	}

	h2 {
		font-size: var(--fs-xl);
		line-height: 1;
	}

	.buttons {
		display: flex;
		gap: var(--s1);
		margin-top: var(--s1);
	}

	@keyframes fade {
		from {
			opacity: 0;
		}
	}

	@keyframes rise {
		from {
			opacity: 0;
			transform: translateY(32px);
		}
	}

	@keyframes drop {
		from {
			opacity: 0;
			transform: translate(-120%, -90%) scale(2.4) rotate(-16deg);
		}
		to {
			opacity: 1;
			transform: none;
		}
	}

	@keyframes thump {
		50% {
			transform: translateY(3px) scale(0.995);
		}
	}

	@keyframes ink {
		to {
			stroke-dashoffset: 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.overlay,
		.envelope,
		.drop,
		.caption,
		.cancel circle,
		.cancel path,
		.cancel text {
			animation: none;
			opacity: 1;
			stroke-dashoffset: 0;
		}
	}
</style>
