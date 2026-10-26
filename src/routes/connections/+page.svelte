<script lang="ts">
	import RefreshCw from '@lucide/svelte/icons/refresh-cw';
	import AppHeader from '#lib/components/AppHeader.svelte';
	import CopyBlock from '#lib/components/CopyBlock.svelte';
	import AiConnect from '#lib/components/AiConnect.svelte';
	import McpApps from '#lib/components/McpApps.svelte';
	import FolderOpen from '@lucide/svelte/icons/folder-open';
	import { untrack } from 'svelte';
	import { api } from '#lib/api.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let token = $state(untrack(() => data.token));
	let chKey = $state('');
	let chSaved = $state(untrack(() => data.cooperhewitt));
	let revealed = $state('');

	const mcpConfig = $derived(JSON.stringify({ mcpServers: { nool: { ...data.mcpEntry, env: { ...data.mcpEntry.env, NOOL_TOKEN: token } } } }, null, 2));

	async function reveal() {
		const r = await fetch('/api/reveal', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ what: 'figma' }) });
		revealed = (await r.json()).opened ? 'Opened. Pick manifest.json in Figma.' : 'Copy the path below instead.';
	}

	async function saveCh(e: SubmitEvent) {
		e.preventDefault();
		const r = await fetch('/api/settings/sources', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ cooperhewitt: chKey }) });
		chSaved = (await r.json()).cooperhewitt;
		chKey = '';
	}

	const curl = $derived(`curl -X POST ${data.origin}/api/inbox/blocks \\
  -H "Authorization: Bearer ${token}" \\
  -H "Content-Type: application/json" \\
  -d '{"project": "Tidal", "type": "note", "source": "Terminal", "data": {"text": "Sent from anywhere"}}'`);

	const blender = $derived(`# Blender: render, then send the render to Nool. Run from the Scripting tab.
import bpy, json, urllib.request, uuid, os

NOOL = "${data.origin}"
TOKEN = "${token}"
PROJECT, STAGE = "Tidal", "Build"

path = os.path.join(bpy.app.tempdir, "nool-render.png")
bpy.context.scene.render.filepath = path
bpy.ops.render.render(write_still=True)

def post(url, body, ctype):
    req = urllib.request.Request(url, data=body, method="POST",
        headers={"Authorization": f"Bearer {TOKEN}", "Content-Type": ctype})
    return json.load(urllib.request.urlopen(req))

b = uuid.uuid4().hex
with open(path, "rb") as f:
    form = (f"--{b}\\r\\nContent-Disposition: form-data; name=\\"file\\"; filename=\\"render.png\\"\\r\\n"
            f"Content-Type: image/png\\r\\n\\r\\n").encode() + f.read() + f"\\r\\n--{b}--\\r\\n".encode()
src = post(NOOL + "/api/inbox/uploads", form, f"multipart/form-data; boundary={b}")["src"]
post(NOOL + "/api/inbox/blocks", json.dumps({"project": PROJECT, "stage": STAGE, "type": "image",
     "source": "Blender", "data": {"src": src, "caption": bpy.path.basename(bpy.data.filepath)}}).encode(),
     "application/json")`);

	async function rotate() {
		if (!confirm('Issue a new token? Apps using the current one will stop sending until you update them.')) return;
		token = (await api.rotateToken()).token;
	}
</script>

<svelte:head>
	<title>Connections · Nool</title>
</svelte:head>

<AppHeader />

<main class="page">
	<header class="intro">
		<h1 class="display">Connections</h1>
		<p class="muted">Two optional extras: an AI helper, and sending work into Nool from the apps you design in.</p>
	</header>

	<section id="ai">
		<h2 class="display">1. AI helper</h2>
		<p class="muted">
			Adds a <strong>Summarize</strong> button to each stage and smarter <strong>Find precedents</strong> results. It
			only runs when you press a button. It never makes the work for you.
		</p>
		<AiConnect providers={data.providers} status={data.ai} />
	</section>

	<section>
		<h2 class="display">2. Chat apps</h2>
		<p class="muted">
			Use Claude, Cursor or Windsurf? Press <strong>Add Nool</strong>, then close and reopen that app. After that you
			can type things like “add a note to my Tidal project” in the chat. Keep Nool open while you do.
		</p>
		<McpApps apps={data.mcpApps} />
	</section>

	<section>
		<h2 class="display">3. Figma</h2>
		<p class="muted">Send frames from Figma straight into a project. You set this up once.</p>
		<ol class="steps">
			<li>Open the <strong>Figma desktop app</strong> (not the website) and open any design file.</li>
			<li>
				In the top menu choose <strong>Plugins</strong>, then <strong>Development</strong>, then
				<strong>Import plugin from manifest</strong>.
			</li>
			<li>
				{#if data.desktop}
					Press
					<button class="btn btn-ghost inline" onclick={reveal}><FolderOpen size={14} strokeWidth={1.5} /> Show plugin file</button>
					here. A folder opens with a file called <strong>manifest.json</strong>. Pick that file in Figma.
					{#if revealed}<span class="label">{revealed}</span>{/if}
				{:else}
					Pick the file called <strong>manifest.json</strong> in Nool's <strong>figma-plugin</strong> folder.
				{/if}
			</li>
			<li>
				Run it from <strong>Plugins</strong>, then <strong>Development</strong>, then <strong>Send to Nool</strong>. It
				asks for two things. Copy them from here:
			</li>
		</ol>
		<div class="pair">
			<CopyBlock label="Address" code={data.origin} />
			<CopyBlock label="Password (token)" code={token} />
		</div>
		<details>
			<summary class="label">Can't find the file?</summary>
			<p class="label">It's here on this computer. Copy this and paste it into the file picker in Figma.</p>
			<CopyBlock label="Plugin file" code={data.figmaManifest} />
		</details>
	</section>

	<section>
		<h2 class="display">4. Museum search</h2>
		<p class="muted">
			Find precedents already searches The Met, research papers and GitHub. To add the Cooper Hewitt design museum, get
			a free key from <a href="https://collection.cooperhewitt.org/api" target="_blank" rel="noreferrer">their site</a> and paste it
			here. Optional.
		</p>
		<form class="inline-form" onsubmit={saveCh}>
			<input type="password" bind:value={chKey} placeholder={chSaved ? 'Key saved' : 'Cooper Hewitt key'} autocomplete="off" />
			<button class="btn">{chSaved && !chKey ? 'Remove' : 'Save'}</button>
		</form>
	</section>

	<details class="dev">
		<summary class="display">For developers</summary>
		<div class="dev-body">
			<div class="head">
				<h3>Token</h3>
				<button class="btn btn-ghost" onclick={rotate}><RefreshCw size={14} strokeWidth={1.5} /> New token</button>
			</div>
			<p class="muted">
				Anything with this token can add to your projects. If you make a new one, press Add Nool again and reconnect
				Figma.
			</p>
			<CopyBlock label="Inbox token" code={token} />

			<h3>Other MCP apps</h3>
			{#if !data.desktop}
				<p class="label">Running from source: install the server once with <code>npm install --prefix mcp</code>.</p>
			{/if}
			<CopyBlock label="MCP config" code={mcpConfig} />

			<h3>Scripts</h3>
			<p class="muted">
				Anything that can make a web request can post to the inbox. Projects and stages can be named instead of ids.
				Leave the stage out and the block lands on the stage you worked in last.
			</p>
			<CopyBlock label="Blender (Python)" code={blender} />
			<CopyBlock label="Terminal (curl)" code={curl} />
			<ul class="ref">
				<li><code>GET /api/inbox</code> lists projects and stages.</li>
				<li><code>POST /api/inbox/uploads</code> takes an image as a <code>file</code> form field and returns <code>{'{ src }'}</code>.</li>
				<li>
					<code>POST /api/inbox/blocks</code> takes <code>{'{ project, stage?, type, data, source? }'}</code>. Types: note
					<code>{'{ text }'}</code>, image <code>{'{ src, caption }'}</code>, link <code>{'{ url, note }'}</code>, quote
					<code>{'{ text, cite }'}</code>, todo <code>{'{ items: [{ text, done }] }'}</code>, palette
					<code>{'{ colors: ["#hex"] }'}</code>.
				</li>
				<li>Every call needs <code>Authorization: Bearer &lt;token&gt;</code>.</li>
			</ul>
		</div>
	</details>
</main>

<style>
	.page {
		max-width: 760px;
		margin: 0 auto;
		padding: var(--s8) var(--s3) var(--s10);
		display: grid;
		gap: var(--s6);
	}

	.intro {
		padding-bottom: var(--s3);
		border-bottom: 1px solid var(--text);
	}

	h1 {
		font-size: var(--fs-xl);
		line-height: 1.1;
	}

	.intro p {
		margin-top: var(--s1);
		max-width: 60ch;
	}

	section {
		display: grid;
		gap: 12px;
		min-width: 0;
	}

	h2 {
		font-size: var(--fs-md);
	}

	.inline {
		display: inline-flex;
		padding: 2px 8px;
		margin-left: 4px;
	}

	.inline-form {
		display: flex;
		gap: var(--s1);
	}

	.inline-form input {
		flex: 1;
		min-width: 0;
		padding: var(--s1);
		border: var(--border);
		border-radius: var(--radius);
		background: var(--surface);
		font: inherit;
	}

	section a {
		color: var(--accent);
	}

	details p {
		margin: 12px 0;
	}

	.head {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.steps,
	.ref {
		margin: 0;
		padding-left: 1.2em;
		display: grid;
		gap: 4px;
	}

	code {
		font-size: var(--fs-xs);
		padding: 1px 4px;
		border-radius: 2px;
		background: var(--surface);
		word-break: break-all;
		border: var(--border);
	}

	.pair {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--s1);
	}

	.dev summary {
		font-size: var(--fs-md);
	}

	.dev-body {
		display: grid;
		gap: 12px;
		margin-top: var(--s2);
	}

	h3 {
		font-size: var(--fs-sm);
		margin-top: var(--s2);
	}

	@media (max-width: 600px) {
		.pair {
			grid-template-columns: 1fr;
		}
	}

	details {
		padding: 12px;
		border: var(--border);
		border-radius: var(--radius);
	}

	summary {
		cursor: pointer;
	}

	.ref {
		margin-top: 12px;
		line-height: 1.6;
	}

	@media (max-width: 600px) {
		.page {
			padding: var(--s5) var(--s2) var(--s8);
		}
	}
</style>
