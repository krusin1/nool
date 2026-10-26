<script lang="ts">
	import { goto } from '$app/navigation';
	import ProjectStamp from './ProjectStamp.svelte';
	import { api } from '#lib/api.ts';
	import { TEMPLATES } from '#lib/templates.ts';

	let { oncancel }: { oncancel: () => void } = $props();

	let title = $state('');
	let description = $state('');
	let template = $state(TEMPLATES[0].id);
	let busy = $state(false);
	let failed = $state('');

	// Preview seed only; the saved stamp is drawn from the project's id.
	const seed = crypto.randomUUID();
	const now = new Date().toISOString();

	async function create(e: SubmitEvent) {
		e.preventDefault();
		busy = true;
		failed = '';
		try {
			const p = await api.createProject(title, description, template);
			await goto(`/p/${p.id}`);
		} catch (err) {
			failed = (err as Error).message;
			busy = false;
		}
	}
</script>

<form class="new" onsubmit={create}>
	<div class="preview" aria-hidden="true">
		<ProjectStamp {seed} title={title || 'Untitled'} date={now} />
	</div>
	<div class="fields">
		<label>
			<span class="label">Title</span>
			<!-- svelte-ignore a11y_autofocus -->
			<input class="title display" bind:value={title} placeholder="Untitled" autofocus />
		</label>
		<label>
			<span class="label">One line about it</span>
			<input bind:value={description} placeholder="What are you making?" />
		</label>
		<fieldset>
			<legend class="label">Stages</legend>
			<div class="templates">
				{#each TEMPLATES as t (t.id)}
					<label class="tpl" class:on={template === t.id}>
						<input type="radio" name="template" value={t.id} bind:group={template} />
						<span class="name">{t.label}</span>
						<span class="hint label">{t.hint}</span>
					</label>
				{/each}
			</div>
			<span class="label">You can rename, add and reorder stages any time.</span>
		</fieldset>
		{#if failed}<p class="label err">{failed}</p>{/if}
		<div class="buttons">
			<button type="button" class="btn btn-ghost" onclick={oncancel}>Cancel</button>
			<button type="submit" class="btn btn-primary" disabled={busy}>{busy ? 'Issuing…' : 'Issue stamp'}</button>
		</div>
	</div>
</form>

<style>
	.new {
		display: grid;
		grid-template-columns: 160px 1fr;
		gap: var(--s4);
		align-items: start;
		padding: var(--s3);
		margin-top: var(--s4);
		border: var(--border);
		border-radius: var(--radius);
		background: var(--surface);
	}

	.fields {
		display: grid;
		gap: var(--s2);
	}

	label {
		display: grid;
		gap: 4px;
	}

	.fields > label input {
		width: 100%;
		padding: var(--s1) 0;
		border: none;
		border-bottom: var(--border);
		background: transparent;
		outline: none;
		transition: border-color var(--ease);
	}

	.fields > label input:focus {
		border-bottom-color: var(--accent);
	}

	.title {
		font-size: var(--fs-lg);
	}

	fieldset {
		display: grid;
		gap: var(--s1);
		margin: 0;
		padding: 0;
		border: none;
	}

	.templates {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--s1);
	}

	.tpl {
		position: relative;
		padding: 12px;
		border: var(--border);
		border-radius: var(--radius);
		cursor: pointer;
		transition: border-color var(--ease);
	}

	.tpl.on {
		border-color: var(--accent);
	}

	.tpl input {
		position: absolute;
		opacity: 0;
	}

	.tpl:focus-within {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
	}

	.name {
		font-weight: var(--fw-bold);
	}

	.buttons {
		display: flex;
		justify-content: flex-end;
		gap: var(--s1);
	}

	.err {
		color: #b42318;
	}

	button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	@media (max-width: 700px) {
		.new {
			grid-template-columns: 1fr;
		}

		.preview {
			width: 130px;
		}

		.templates {
			grid-template-columns: 1fr;
		}
	}
</style>
