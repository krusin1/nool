<script lang="ts">
	import { SITE_URL } from '#lib/links.ts';
	// Shown only in the browser preview (npm run build:web).
	let confirming = $state(false);

	function startOver() {
		try {
			sessionStorage.setItem('nool-reset', '1');
		} catch {
			/* private window: a reload starts over anyway */
		}
		location.href = '/';
	}
</script>

<div class="preview" role="note">
	<span><strong>Browser preview.</strong> Your projects are saved only in this browser, on this computer.</span>
	<span class="actions">
		{#if confirming}
			<span>Delete everything here and start again?</span>
			<button onclick={startOver}>Yes, start over</button>
			<button onclick={() => (confirming = false)}>Cancel</button>
		{:else}
			<button onclick={() => (confirming = true)}>Start over</button>
			<a href="{SITE_URL}/#get">Get the desktop app</a>
		{/if}
	</span>
</div>

<style>
	.preview {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 6px 16px;
		padding: 8px 24px;
		background: var(--accent);
		color: #fff;
		font-size: var(--fs-sm);
	}

	.actions {
		display: flex;
		align-items: center;
		gap: 16px;
	}

	button,
	a {
		padding: 0;
		border: 0;
		background: none;
		color: inherit;
		font: inherit;
		font-weight: var(--fw-bold);
		text-decoration: underline;
		text-underline-offset: 3px;
		cursor: pointer;
	}

	@media print {
		.preview {
			display: none;
		}
	}
</style>
