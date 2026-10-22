<script lang="ts">
	import ProjectStamp from './ProjectStamp.svelte';
	import type { Project } from '#lib/types.ts';

	let { project, cover, entryCount }: { project: Project; cover: string | null; entryCount: number } = $props();
</script>

<a class="card" href="/p/{project.id}">
	<ProjectStamp
		seed={project.id}
		title={project.title}
		image={cover}
		value={entryCount}
		published={project.published}
		date={project.created_at}
	/>
	<span class="meta label">
		<span>{project.published ? 'Published' : 'In progress'}</span>
		<span>{entryCount} {entryCount === 1 ? 'entry' : 'entries'}</span>
	</span>
</a>

<style>
	.card {
		display: grid;
		gap: var(--s2);
		text-decoration: none;
	}

	.card:hover :global(.wrap) {
		transform: rotate(0deg) translateY(-4px);
	}

	.meta {
		display: flex;
		justify-content: space-between;
		padding: 0 4px;
	}
</style>
