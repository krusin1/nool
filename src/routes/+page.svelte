<script lang="ts">
	import Plus from '@lucide/svelte/icons/plus';
	import AppHeader from '#lib/components/AppHeader.svelte';
	import ProjectRow from '#lib/components/ProjectRow.svelte';
	import StampCard from '#lib/components/StampCard.svelte';
	import ViewToggle from '#lib/components/ViewToggle.svelte';
	import NewProjectForm from '#lib/components/NewProjectForm.svelte';
	import type { HomeView } from '#lib/types.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let creating = $state(false);
	let view = $state<HomeView>('stamps');

	$effect(() => {
		try {
			const saved = localStorage.getItem('nool:home-view');
			if (saved === 'list' || saved === 'stamps') view = saved;
		} catch {
			/* storage unavailable: keep default */
		}
	});

	function setView(v: HomeView) {
		view = v;
		try {
			localStorage.setItem('nool:home-view', v);
		} catch {
			/* ignore */
		}
	}
</script>

<svelte:head>
	<title>Album · Nool</title>
</svelte:head>

<AppHeader />

<main class="home" class:wide={view === 'stamps'}>
	<div class="intro">
		<div>
			<h1 class="display">Album</h1>
			<p class="muted">Every project is a stamp. Mint while you work, postmarked when you post it.</p>
		</div>
		<div class="controls">
			<ViewToggle {view} onchange={setView} />
			{#if !creating}
				<button class="btn btn-primary" onclick={() => (creating = true)}>
					<Plus size={16} strokeWidth={1.5} /> New stamp
				</button>
			{/if}
		</div>
	</div>

	{#if creating}
		<NewProjectForm oncancel={() => (creating = false)} />
	{/if}

	{#if !data.projects.length && !creating}
		<div class="empty">
			<p class="display">Your album is empty.</p>
			<p class="muted">Issue a stamp for the project you're working on now.</p>
		</div>
	{:else if view === 'stamps'}
		<section class="stamps" aria-label="Your projects">
			{#each data.projects as summary (summary.project.id)}
				<StampCard {summary} />
			{/each}
		</section>
	{:else}
		<section class="list" aria-label="Your projects">
			{#each data.projects as summary (summary.project.id)}
				<ProjectRow {summary} />
			{/each}
		</section>
	{/if}
</main>

<style>
	.home {
		max-width: 880px;
		margin: 0 auto;
		padding: var(--s8) var(--s3) var(--s10);
	}

	.home.wide {
		max-width: 1120px;
	}

	.intro {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: var(--s3);
		padding-bottom: var(--s3);
		border-bottom: 1px solid var(--text);
	}

	h1 {
		font-size: var(--fs-xl);
		line-height: 1.1;
	}

	.intro p {
		margin-top: var(--s1);
	}

	.controls {
		display: flex;
		align-items: center;
		gap: var(--s1);
	}

	.empty {
		padding: var(--s8) 0;
		text-align: center;
	}

	.empty .display {
		font-size: var(--fs-lg);
		margin-bottom: var(--s1);
	}

	.stamps {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: var(--s6) var(--s5);
		padding: var(--s6) var(--s2) 0;
	}

	@media (max-width: 600px) {
		.home {
			padding: var(--s5) var(--s2) var(--s8);
		}

		.intro {
			flex-direction: column;
			align-items: flex-start;
		}

		.stamps {
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: var(--s4) var(--s3);
			padding: var(--s4) var(--s1) 0;
		}
	}
</style>
