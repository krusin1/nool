# Nool

Nool is Tamil for thread, and also for book. A process log for makers: document a project as you make it, keep what it builds on, and post it as a case study.

## Run

```
npm install
npm run dev
```

Open http://localhost:5173. The first start creates `data/nool.db` and three demo projects.

- `npm run seed` clears the database so the demo projects come back on the next start (uploads are kept).
- `npm run build` then `npm start` runs the production build (port 3000).

Data lives in `data/` (database and uploaded images). Set `NOOL_DATA_DIR` to keep it somewhere else.

## Connections

Other apps can send notes, links and images into Nool. Open **Connections** in the app for your token and setup.

- **MCP**: `npm install --prefix mcp`, then add the config from the Connections page to Claude Desktop, Cursor or another MCP app.
- **Scripts**: `POST /api/inbox/blocks` with `Authorization: Bearer <token>`. The Connections page has Blender and curl examples.

## Structure

- `src/lib/server/` database, repositories, validation, uploads, inbox helpers
- `src/routes/api/` JSON API for the desk; `src/routes/api/inbox/` token-protected API for other apps
- `src/lib/components/` UI, one component per file; `blocks/` holds the block editors
- `mcp/` standalone MCP server (its own dependencies, so the app stays light)
