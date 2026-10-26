<script lang="ts">
	import { pad2 } from '#lib/format.ts';
	import type { Project, Stage } from '#lib/types.ts';

	let {
		project,
		span,
		sections,
		total,
		blockCount,
		keptCount
	}: {
		project: Project;
		span: string;
		sections: { stage: Stage; index: number }[];
		total: number;
		blockCount: number;
		keptCount: number;
	} = $props();
</script>

<header class="masthead">
	<div class="inner">
		<span class="label kicker">Case study</span>
		<h1 class="display">{project.title}</h1>
		{#if project.description}<p class="dek">{project.description}</p>{/if}

		<dl class="facts">
			<div><dt class="label">Documented</dt><dd>{span}</dd></div>
			<div><dt class="label">Blocks</dt><dd>{blockCount}</dd></div>
			<div><dt class="label">Stages</dt><dd>{sections.length} of {total}</dd></div>
			<div><dt class="label">Lineage</dt><dd>{keptCount} works</dd></div>
		</dl>

		<nav class="contents" aria-label="Contents">
			{#each sections as { stage, index } (stage.id)}
				<a href="#stage-{stage.id}"><span class="label">{pad2(index + 1)}</span> {stage.name}</a>
			{/each}
			{#if keptCount}<a href="#lineage"><span class="label">→</span> Lineage</a>{/if}
		</nav>
	</div>
</header>

<style>
	.masthead {
		display: grid;
		grid-template-columns: 96px minmax(0, 640px) 240px;
		gap: var(--s6);
		padding: var(--s10) 0 var(--s8);
	}

	.inner {
		grid-column: 2 / 4;
		display: grid;
		gap: var(--s3);
	}

	.kicker {
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--accent);
	}

	h1 {
		font-size: var(--fs-xl);
		line-height: 1.05;
	}

	.dek {
		max-width: 34ch;
		font-size: var(--fs-lg);
		line-height: 1.35;
		color: var(--muted);
	}

	.facts {
		display: grid;
		grid-template-columns: repeat(4, auto);
		justify-content: start;
		gap: var(--s5);
		margin: var(--s2) 0 0;
		padding: var(--s2) 0;
		border-top: 1px solid var(--text);
		border-bottom: var(--border);
	}

	dd {
		margin: 2px 0 0;
		font-weight: var(--fw-bold);
	}

	.contents {
		display: flex;
		flex-wrap: wrap;
		gap: var(--s1) var(--s3);
	}

	.contents a {
		text-decoration: none;
		transition: color var(--ease);
	}

	.contents a:hover {
		color: var(--accent);
	}

	@media (max-width: 1100px) {
		.masthead {
			grid-template-columns: minmax(0, 1fr);
			padding: var(--s8) 0 var(--s6);
		}

		.inner {
			grid-column: 1;
		}
	}

	@media (max-width: 600px) {
		.masthead {
			padding: var(--s5) 0 var(--s4);
		}

		.facts {
			grid-template-columns: repeat(2, auto);
			gap: var(--s2) var(--s4);
		}

		.dek {
			font-size: var(--fs-md);
		}
	}
</style>
