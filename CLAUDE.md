# Nool (working name)

Nool is Tamil for thread, and also for book.

A process documentation platform for designers and creative technologists. Makers document their project as they work. An AI precedent finder runs alongside and surfaces related artworks, papers, code and projects for the stage they are in. Finished projects publish as a page with a "lineage" section showing what the work builds on.

Principle: AI connects and documents. People make. The AI never generates the creative work itself.

## Prototype goal

A working, clickable prototype that demonstrates one full loop:
create project → drop content into stages → AI structures it → precedents appear → keep precedents → publish a project page.

Optimize for clarity of the core loop, not completeness. No auth, no multi-user, no payments.

## Stack

- SvelteKit (TypeScript), Svelte 5 runes
- Plain CSS with custom properties (no Tailwind, no component library)
- SQLite via better-sqlite3 for local persistence
- Anthropic API for structuring and query generation (server-side only, key in `.env` as `ANTHROPIC_API_KEY`)
- Precedent sources (all free):
  - Semantic Scholar API (papers)
  - arXiv API (papers)
  - The Met Collection API (art and objects, no key)
  - Cooper Hewitt API (design objects, key in `.env` as `COOPER_HEWITT_KEY`, optional)
  - GitHub search API (code)
- Local file uploads stored in `/static/uploads` for the prototype

## Data model

- `project`: id, title, one-line description, created_at, published (bool)
- `entry`: id, project_id, stage, type (text | image | link | voice), raw_content, file_path, ai_summary, created_at
- `board_item` (moodboard): id, project_id, kind (image | note | quote | swatch | label), content, caption, x, y, w (percent of the spread), rotate, z, tape (bool)
- `precedent`: id, project_id, stage, source, title, creator, year, url, image_url, snippet, kept (bool), note
- Stages (fixed, in order): `spark`, `moodboard`, `research`, `experiments`, `build`, `outcome`

## Screens

1. **Projects home** (`/`): "New project" button and two views, toggled and remembered per browser:
   - Stamps (default): each project is a perforated postage stamp. Picture is the project's most finished image; with no image, a generated motif plus the title. Palette, tilt and motif come from a hash of the project id, so every new project gets a new stamp. Title sits in the bottom-left corner, entry count as the value top-right. Published projects carry a postmark.
   - List: rows with title, description, stage progress, counts, status.
   - The new project form shows a live stamp preview.
2. **Project workspace** (`/p/[id]`): three columns.
   - Left: stage rail (5 stages, current stage highlighted, entry count per stage).
   - Center: entries for the selected stage, newest first. Drop zone at top accepts text, images, links. Each entry shows raw content and an editable AI summary.
   - Moodboard stage: the center becomes a two-page book spread. Makers collage images, notes, quotes, color swatches and labels, drag to arrange, double-click to edit text, rotate and remove.
   - Right: precedent panel for the selected stage. Cards with title, creator, year, source label, thumbnail if available. Actions: Keep (with optional note), Dismiss. "Refresh precedents" button.
3. **Published page** (`/view/[id]`): editorial reading layout. Masthead with facts and contents, each stage as a numbered section with summaries and figures, kept precedents as numbered notes in the margin, the moodboard spread shown full width, then a "Lineage" section listing kept precedents with the maker's notes.

## AI behavior

- On new entry: generate a 1 to 2 sentence summary in the maker's voice. Never invent facts not present in the entry.
- Precedent search: send the project title, description, and all entries for the current stage to Claude. Ask it to return 3 to 5 search queries tailored to the stage, as JSON:
  - spark: artworks, installations, projects with similar concepts
  - moodboard: visual references, artworks, design objects
  - research: academic papers, theory
  - experiments: technical approaches to the same problem
  - build: code, tools, components
  - outcome: closest prior works, for positioning
- Run queries against the relevant sources, dedupe, then ask Claude to rank the top 8 by relevance and write a one-line "why this is relevant" for each.
- Cache results per project and stage in SQLite. Only refetch on "Refresh".

## Design system

Clean, minimal, editorial. Think a well-set print journal, not a SaaS dashboard.

- Colors (CSS custom properties on `:root`):
  - `--bg: #FAFAF8`, `--surface: #FFFFFF`, `--text: #111111`, `--muted: #6B6B6B`, `--line: #E6E6E3`, `--accent: #2B4BFF`
  - Dark mode via `prefers-color-scheme` with equivalent tokens.
- Type: all grotesk. Space Grotesk for titles, numerals and the wordmark (`--font-display`), Hanken Grotesk for interface and reading text (`--font-ui`). Two weights only (400, 600).
- Logo: a perforated stamp in the accent color with one thread writing an "n" (`src/lib/components/Logo.svelte`).
- Scale: 13 / 15 / 18 / 24 / 36 px.
- Spacing on an 8px grid. Generous whitespace.
- 1px borders using `--line`. No shadows, no gradients, minimal rounding (4px max).
- Accent color used sparingly: active stage, primary action, kept state.
- Motion: 150ms ease for hover and state changes only.
- Icons: Lucide, stroke 1.5, 16px.
- Responsive: workspace collapses to a single column with tabs (Entries / Precedents) under 900px.

## Build order

Work in phases. Finish and verify each phase before starting the next. Commit after each phase.

1. Scaffold SvelteKit, design tokens, layout shell, all three screens with hardcoded mock data.
2. SQLite schema and server routes. Projects and entries persist. Text, image and link entries work.
3. AI summaries on entries (Anthropic API, server-side).
4. Precedent finder: query generation, source fetchers, ranking, cache, Keep and Dismiss.
5. Published page with lineage section.
6. Polish: empty states, loading states, error handling for failed API calls, responsive layout.

## Conventions

- Keep components small. One component per file in `src/lib/components`.
- Each precedent source gets its own module in `src/lib/server/sources/` with a shared return type.
- All external API calls happen server-side.
- Fail gracefully: if a source errors, show results from the others.
- Seed script (`npm run seed`) creates one demo project with entries in every stage for testing.
