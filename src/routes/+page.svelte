<script lang="ts">
	import Plus from '@lucide/svelte/icons/plus';
	import AppHeader from '#lib/components/AppHeader.svelte';
	import ProjectRow from '#lib/components/ProjectRow.svelte';
	import NewProjectForm from '#lib/components/NewProjectForm.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let creating = $state(false);
</script>

<svelte:head>
	<title>Projects · Marginalia</title>
</svelte:head>

<AppHeader />

<main class="home">
	<div class="intro">
		<div>
			<h1 class="serif">Projects</h1>
			<p class="muted">Document as you make. Precedents follow along.</p>
		</div>
		{#if !creating}
			<button class="btn btn-primary" onclick={() => (creating = true)}>
				<Plus size={16} strokeWidth={1.5} /> New project
			</button>
		{/if}
	</div>

	{#if creating}
		<NewProjectForm oncancel={() => (creating = false)} />
	{/if}

	<section class="list" aria-label="Your projects">
		{#each data.projects as item (item.project.id)}
			<ProjectRow project={item.project} entries={item.entries} />
		{/each}
	</section>
</main>

<style>
	.home {
		max-width: 880px;
		margin: 0 auto;
		padding: var(--s8) var(--s3) var(--s10);
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
		letter-spacing: -0.01em;
	}

	.intro p {
		margin-top: var(--s1);
	}

	@media (max-width: 600px) {
		.home {
			padding: var(--s5) var(--s2) var(--s8);
		}

		.intro {
			flex-direction: column;
			align-items: flex-start;
		}
	}
</style>
