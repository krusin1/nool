<script lang="ts">
	import RefreshCw from '@lucide/svelte/icons/refresh-cw';
	import AppHeader from '#lib/components/AppHeader.svelte';
	import CopyBlock from '#lib/components/CopyBlock.svelte';
	import { untrack } from 'svelte';
	import { api } from '#lib/api.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let token = $state(untrack(() => data.token));

	const mcpConfig = $derived(
		JSON.stringify(
			{ mcpServers: { nool: { command: 'node', args: [data.mcpPath], env: { NOOL_URL: data.origin, NOOL_TOKEN: token } } } },
			null,
			2
		)
	);

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
		<p class="muted">
			Send work into Nool from the apps you make it in. Exports, renders, notes and links land on the right stage
			without leaving what you're doing. Each block shows which app sent it.
		</p>
	</header>

	<section>
		<div class="head">
			<h2 class="display">Your token</h2>
			<button class="btn btn-ghost" onclick={rotate}><RefreshCw size={14} strokeWidth={1.5} /> New token</button>
		</div>
		<p class="muted">Anything with this token can add to your projects. Keep it private.</p>
		<CopyBlock label="Inbox token" code={token} />
	</section>

	<section>
		<h2 class="display">Figma</h2>
		<p class="muted">
			The Send to Nool plugin exports the frames you select and sends them, with an optional caption or note, to the
			project and stage you pick. No other app in between.
		</p>
		<ol class="steps">
			<li>In the Figma desktop app: Plugins → Development → Import plugin from manifest.</li>
			<li>Choose <code>figma-plugin/manifest.json</code> in the Nool folder.</li>
			<li>Run it from Plugins → Development → Send to Nool. Open Connection, paste the address and token below, and Connect.</li>
		</ol>
		<CopyBlock label="Nool address for the plugin" code={data.origin} />
	</section>

	<section>
		<h2 class="display">AI apps, through MCP</h2>
		<p class="muted">
			The Nool MCP server lets Claude, Cursor and other MCP apps list your projects and add notes, links, quotes and
			images. With other MCP servers connected alongside it, such as Figma's or a Blender one, you can ask things
			like “export the selected frame and add it to Tidal, Build stage.”
		</p>
		<ol class="steps">
			<li>Install it once: open a terminal in the Nool folder and run <code>npm install --prefix mcp</code>.</li>
			<li>Add this to your MCP app's config. In Claude Desktop: Settings → Developer → Edit config.</li>
			<li>Restart the app. Nool needs to be running for the tools to work.</li>
		</ol>
		<CopyBlock label="MCP config" code={mcpConfig} />
	</section>

	<section>
		<h2 class="display">Scripts and plugins</h2>
		<p class="muted">
			Anything that can make a web request can post to the inbox: a Blender script, a Figma plugin, a shortcut on
			your phone. Projects and stages can be named instead of using ids. Leave the stage out and the block lands on
			the stage you worked in last.
		</p>
		<CopyBlock label="Blender (Python)" code={blender} />
		<CopyBlock label="Terminal (curl)" code={curl} />
		<details>
			<summary class="label">Inbox API reference</summary>
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
		</details>
	</section>
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
		border: var(--border);
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
