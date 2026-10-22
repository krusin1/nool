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
	<title>Projects · Nool</title>
</svelte:head>

<AppHeader />

<main class="home" class:wide={view === 'stamps'}>
	<div class="intro">
		<div>
			<h1 class="display">Projects</h1>
			<p class="muted">Show what your work builds on.</p>
		</div>
		<div class="controls">
			<ViewToggle {view} onchange={setView} />
			{#if !creating}
				<button class="btn btn-primary" onclick={() => (creating = true)}>
					<Plus size={16} strokeWidth={1.5} /> New project
				</button>
			{/if}
		</div>
	</div>

	{#if creating}
		<NewProjectForm oncancel={() => (creating = false)} />
	{/if}

	{#if view === 'stamps'}
		<section class="stamps" aria-label="Your projects">
			{#each data.projects as item (item.project.id)}
				<StampCard project={item.project} cover={item.cover} entryCount={item.entries.length} />
			{/each}
		</section>
	{:else}
		<section class="list" aria-label="Your projects">
			{#each data.projects as item (item.project.id)}
				<ProjectRow project={item.project} entries={item.entries} />
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
