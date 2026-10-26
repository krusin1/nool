<script lang="ts">
	import StampArt from './StampArt.svelte';
	import Postmark from './Postmark.svelte';
	import { PERFORATION, stampLook } from '#lib/stamp.ts';

	let {
		seed,
		title,
		image = null,
		value = 0,
		posted = null,
		date
	}: {
		seed: string;
		title: string;
		image?: string | null;
		value?: number;
		posted?: string | null;
		date: string;
	} = $props();

	const look = $derived(stampLook(seed));
	const year = $derived(new Date(date).getFullYear());
</script>

<div class="wrap" style="--paper:{look.paper}; --ink:{look.ink}; --tilt:{look.tilt}deg">
	<div class="stamp" style="mask-image:{PERFORATION}; -webkit-mask-image:{PERFORATION}">
		<div class="frame" class:art={!image}>
			{#if image}
				<img src={image} alt="" loading="lazy" />
			{:else}
				<StampArt motif={look.motif} />
			{/if}

			<span class="country">NOOL · {year}</span>
			<span class="value display">{String(value).padStart(2, '0')}</span>

			{#if image}
				<span class="title display">{title || 'Untitled'}</span>
			{:else}
				<span class="big-title display">{title || 'Untitled'}</span>
			{/if}
		</div>
	</div>
	{#if posted}
		<Postmark date={posted} />
	{/if}
</div>

<style>
	.wrap {
		position: relative;
		container-type: inline-size;
		transform: rotate(var(--tilt));
		transition: transform var(--ease);
	}

	.stamp {
		aspect-ratio: 4 / 5;
		padding: 7.5%;
		background: var(--paper);
		mask-size: 100% 100%;
		-webkit-mask-size: 100% 100%;
	}

	.frame {
		position: relative;
		height: 100%;
		overflow: hidden;
		background: var(--ink);
		color: var(--paper);
		outline: 1px solid color-mix(in srgb, var(--ink) 40%, transparent);
		outline-offset: 3px;
	}

	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.country {
		position: absolute;
		top: 6%;
		left: 7%;
		font-size: 5cqw;
		font-weight: var(--fw-bold);
		letter-spacing: 0.08em;
	}

	.value {
		position: absolute;
		top: 4%;
		right: 7%;
		font-size: 11cqw;
		font-weight: var(--fw-bold);
		line-height: 1;
	}

	/* Over a photo, corner text sits on small paper tabs so it stays legible. */
	.frame:not(.art) .country,
	.frame:not(.art) .value {
		padding: 1.5cqw 2.5cqw;
		background: var(--paper);
		color: var(--ink);
		top: 0;
	}

	.frame:not(.art) .country {
		left: 0;
	}

	.frame:not(.art) .value {
		right: 0;
	}

	.title {
		position: absolute;
		left: 0;
		bottom: 0;
		max-width: 85%;
		padding: 2.5cqw 4cqw 2cqw;
		background: var(--paper);
		color: var(--ink);
		font-size: 8cqw;
		font-weight: var(--fw-bold);
		line-height: 1.05;
	}

	.big-title {
		position: absolute;
		left: 7%;
		right: 7%;
		bottom: 6%;
		font-size: 13cqw;
		font-weight: var(--fw-bold);
		line-height: 0.95;
		display: -webkit-box;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
