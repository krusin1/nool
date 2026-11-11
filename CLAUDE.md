# Nool

Nool is Tamil for thread, and also for book. A process documentation platform for designers and creative technologists. Makers document a project while they work on it, keep the works it builds on, and post it as a case study (a "letter") with a lineage section.

Principle: AI connects and documents. People make. The AI never generates the creative work itself.

Documentation should feel like part of making, not an extra step: capture is one keystroke, paste or drop; other apps can send work in directly.

## Language (postage)

- Home is the **Album**. Each project is a **stamp**.
- In progress = **mint**. Published = **posted**, shown with a postmark.
- New project = **Issue a stamp**. Publish = **Post**. Unpublish = **Recall**.
- The workspace is the **desk**. The published case study is the **letter**.

## Stack

- SvelteKit 3 (TypeScript), Svelte 5 runes, adapter-node. Imports use `#lib/...` with file extensions (`#lib/types.ts`).
- Plain CSS with custom properties. No component library.
- SQLite via Node's built-in `node:sqlite` (Node 22.13+; no native modules), file at `data/nool.db` (override with `NOOL_DATA_DIR`). Uploads in `data/uploads`, served from `/uploads/[name]`.
- No hosted backend, no accounts. Each person's data lives on their own computer. Optional backup to a file or to their own Google Drive.
- Lucide icons, Space Grotesk and Hanken Grotesk via Fontsource.
- `mcp/`: standalone MCP server with its own package.json, so the app stays light. Bundled to one file (`mcp/dist`) for the desktop app.
- `figma-plugin/`: Send to Nool plugin (plain JS).
- `src-tauri/`: desktop shell (Tauri 2). Starts the bundled Node runtime (`nool-node` sidecar) running the adapter-node server (`server/start.js`) on 127.0.0.1:5173 with data in the OS app-data folder, then shows it in a window. Links open in the system browser via `/api/open`.
- `site/`: static download page and docs, deployed on Vercel. Post office design: one ruled sheet, airmail edge, stamps and postmarks, Instrument Serif italics; nav is only Home and Docs. Links to the latest GitHub Release. "Open in app" uses the `nool://` link the desktop app registers (tauri-plugin-deep-link; `nool://p/<id>` opens a project).
- `.github/workflows/release.yml`: builds macOS (Apple Silicon), Windows and Linux installers on tag `v*`.

## Data model

- `projects`: id, title, description, created_at, updated_at, posted_at (null = mint)
- `stages`: id, project_id, name, position. Fully customizable: rename, add, delete (a project keeps at least one), reorder.
- `blocks`: id, project_id, stage_id, type, data (JSON), position, source ('desk' or the sending app), created_at, updated_at
  - types: note `{text}`, image `{src, caption}`, link `{url, note}`, quote `{text, cite}`, todo `{items:[{text,done}]}`, palette `{colors}`, spread `{items: SpreadItem[]}` (book-spread collage), voice `{src, caption, transcript, duration}`
- `precedents`: id, project_id, stage_id, source, title, creator, year, url, image_url, snippet, kept, note
- `settings`: key/value (inbox token)
- Sample project: one, Signal Garden (`seed-data.json`, images and audio in `static/demo/garden`), posted, every stage filled with every block type, blocks marked via Phone, Figma and Claude summary, kept and unkept precedents. Seed blocks may set `source`.
- Templates for new projects: Studio (Spark, Moodboard with a spread, Research, Experiments, Build, Outcome), Simple, Blank.

## Screens

1. **Album** (`/`): stamps view (default) and list view. Stamp picture is the project's last image; with none, a generated motif and the title. Palette, tilt and motif come from a hash of the id. Value = block count. Posted stamps carry a postmark. "New stamp" form with live stamp preview and template choice.
2. **Desk** (`/p/[id]`): stage rail (edit mode for stages), blocks for the selected stage with inline editing and autosave, composer at the foot (Enter = note, URL = link, paste/drop images, one-click block types), precedent panel (manual add, keep, note, dismiss). Header: editable title and description, save status, Letter, Post/Recall, delete. Posting plays the stamp-on-envelope animation. Under 900px: single column with Blocks / Precedents tabs.
3. **Letter** (`/view/[id]`): editorial case study, with Share (web page, website folder, PDF). Masthead, stages as numbered sections, empty blocks hidden, figures numbered, kept precedents as margin notes keyed to the Lineage list.
0. **Welcome** (`/welcome`): first launch only (settings `welcomed`). Three steps: what Nool is, connect an AI (optional, skippable), ready.
4. **Connections** (`/connections`): AI helper, chat apps, Figma, phone (QR), museum search, inbox token, Figma plugin, MCP config, Blender and curl examples, API reference.
5. **Backups** (`/backups`): save/restore a `.nool` backup file (gzipped JSON: database snapshot + images); Google Drive backup with `drive.file` scope, manual or daily, last 10 kept. Restoring replaces projects and saves a safety copy first.

## API

- Desk API under `/api/` (projects, stages, blocks, precedents, uploads). Same-origin only for writes (enforced in `hooks.server.ts`).
- Inbox API under `/api/inbox/` for other apps, `Authorization: Bearer <token>`: `GET /api/inbox`, `POST /api/inbox/blocks` `{project, stage?, type, data, source?}` (names or ids; no stage = last-used stage), `POST /api/inbox/uploads` (multipart `file`).
- AI and setup: `PUT/DELETE /api/settings/ai`, `POST /api/stages/[id]/summary`, `POST /api/stages/[id]/find`, `GET/POST/DELETE /api/mcp`, `PUT /api/settings/sources`.
- MCP tools: list_projects, add_note, add_link, add_quote, add_image (local path or URL), read_stage, add_summary, search_precedents, suggest_precedents. Inbox also has `GET /api/inbox/stage`, `POST /api/inbox/search`, `POST /api/inbox/precedents`.
- Without an AI key, Summarize and Find precedents offer "with Claude Desktop": copy a request, open `claude://`, Claude does the work through the MCP tools on the user's own Claude plan. The desk refreshes blocks and precedents on window focus.

## Design system

Clean, minimal, editorial. A well-set print journal, not a SaaS dashboard.

- Colors on `:root`: `--bg #FAFAF8`, `--surface #FFFFFF`, `--text #111111`, `--muted #6B6B6B`, `--line #E6E6E3`, `--accent #2B4BFF`. Dark mode via `prefers-color-scheme`.
- Type: all grotesk. Space Grotesk for titles, numerals and wordmark (`--font-display`), Hanken Grotesk for interface and reading (`--font-ui`). Weights 400 and 600.
- Scale 13 / 15 / 18 / 24 / 36. 8px spacing grid. 1px borders, no shadows, no gradients in UI, 4px max radius.
- Accent sparingly: active stage, primary action, kept and posted states.
- Motion: 150ms ease for hover and state changes. The posting animation is the one exception; it respects reduced motion.
- Icons: Lucide, stroke 1.5, 16px.
- Logo: perforated stamp with one thread writing an "n" (`Logo.svelte`).

## Secrets

Never commit keys or tokens. `.env` and `.env.*` are git-ignored. `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` (Google OAuth Desktop client) come from a local `.env` in development and from GitHub Actions secrets in release builds, where they are compiled into the app.

## Roadmap

Done: scaffold, persistence, customizable stages, blocks, posting, letter, connections (inbox API, MCP, Figma plugin), backups, desktop app, download site.

Done (opt-in AI): everything runs only on a button press.
- AI connection on Connections (`ai.ts`): Claude, ChatGPT, Gemini, OpenRouter, Ollama (local), any OpenAI-compatible. Key saved in local `settings` (`ai`), checked before saving, never sent to the page.
- Summarize (stage head): from the stage's own notes, never invented; shown for editing, added as a note only if the maker chooses.
- Find precedents (panel): queries from AI or keywords; Semantic Scholar, arXiv, The Met, Cooper Hewitt (key in settings `cooperhewitt_key`), GitHub in `src/lib/server/sources/`; dedupe; AI ranks top 8 with a "why", else round-robin. Suggestions are unkept rows; finding again replaces unkept suggestions only. Failed sources are reported.
- One-click MCP setup (`mcp-install.ts`) for Claude Desktop, Cursor, Windsurf; backs up the config as `.before-nool`. Figma steps with "Show it" (desktop).

Done: drag-and-drop block reordering (grip handle), Replace button on images (clicking an image does nothing), remove colors from palettes, plain-language Connections with a collapsed For developers section.

Done: voice notes and phone capture.
- Voice block: record in the composer (MediaRecorder, `recorder.svelte.ts`), play back, caption; Transcribe button only when the connected AI has speech (OpenAI or a custom OpenAI-compatible service, `ai.ts` `transcribe`). Uploads accept audio (40 MB) and `/uploads/[name]` serves byte ranges. macOS mic permission in `src-tauri/Info.plist`. Desktop server runs with `BODY_SIZE_LIMIT=50M`.
- Phone capture (`phone.ts`, `phone-page.ts`): off by default (settings `phone`). When on, a second server on 0.0.0.0:PORT+1 serves one capture page and three add-only routes (`/projects`, `/upload`, `/block`), each needing the pairing key (settings `phone_key`) from the QR on Connections. Blocks arrive with source "Phone". Unpair = new key.

Done: share the letter (`export.ts`, Share menu on the letter, `ShareLetter.svelte`).
- Web page: one .html with CSS, woff2 fonts and images inlined as data URIs, no scripts. Website folder: .zip with index.html, assets/style.css, fonts, images/ and a README. Both are made from `/view/[id]?export=1` (no app bar) via event.fetch; built CSS, fonts and static files are read from disk (build/client or static/).
- PDF: print stylesheet on the letter; the browser prints directly, the desktop app opens `/view/[id]?print=1` in the system browser, which opens the print dialog.
- Desktop can't download from the webview, so `POST /api/projects/[id]/export` saves to ~/Downloads (never overwriting) and reveals the file; browsers use `GET …/export?format=html|zip`.
- `build/start.js` (from `scripts/start.js`) is the server entry: it marks requests as http. adapter-node 6 otherwise assumes https and no longer reads ORIGIN, which broke same-origin writes in the desktop app.

Done: browser preview (`npm run build:web`, Vercel project from the repo root via `vercel.json`).
- Same app, no server: `scripts/make-web.js` copies `src/routes` to `src/routes-web` without server loads and endpoints and adds the browser loaders in `src/web/routes`, and copies `src/lib/server` to `src/lib/web-server` with browser versions from `src/web/server` (sql.js database saved in IndexedDB, uploads as data URLs, settings, AI off). A Vite plugin points `lib/server` imports at the copy. `src/web/api.ts` answers same-origin `/api` fetches in the page with the real handlers for projects, stages, blocks, precedents, uploads and welcomed; everything else says it's in the desktop app.
- Preview banner (Start over, get the desktop app), PDF-only Share, no AI or precedent search, Connections and Backups go to `/desktop`. `SITE_URL` in `src/lib/links.ts`.

Next: to be decided.

## Conventions

- One component per file in `src/lib/components` (block editors in `blocks/`).
- Server code in `src/lib/server/` (db, repo/*, validate, uploads, inbox). All external calls server-side.
- Validate every write in `validate.ts`. Keep the client bundle small: no heavy dependencies.
- `npm run seed` clears the database; demo projects are inserted on next start.
