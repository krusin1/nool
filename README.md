# Nool

Nool is Tamil for thread, and also for book. A process log for makers: document a project as you make it, keep what it builds on, and post it as a case study.

Nool is a desktop app. There is no server and no account: your projects stay on your computer. You can back them up to a file or to your own Google Drive.

## Download

Get the installer for your computer from the [latest release](https://github.com/krusin1/nool/releases/latest).

First launch, because the app isn't signed with a paid developer certificate yet:
- **macOS**: right-click Nool in Applications → Open → Open.
- **Windows**: if SmartScreen appears, click More info → Run anyway.

## Develop

Needs Node 22.13 or newer.

```
npm install
npm run dev
```

Open http://localhost:5173. The first start creates `data/nool.db` and three demo projects. `npm run seed` clears the database so they come back.

Desktop build (needs Rust): `npm run build:desktop`, `node scripts/fetch-node.mjs`, then `npm run tauri build`.

## Connections

- **Figma**: import `figma-plugin/manifest.json` in the Figma desktop app (Plugins → Development → Import plugin from manifest), then connect it with your token from Connections.
- **MCP** (Claude Desktop, Cursor…): the Connections page shows the config to paste. From source, run `npm install --prefix mcp` first; the desktop app includes everything.
- **Scripts**: `POST /api/inbox/blocks` with `Authorization: Bearer <token>`. Connections has Blender and curl examples.

## Releases

Push a tag like `v0.1.0`. GitHub Actions builds installers for macOS, Windows and Linux and attaches them to the release. Google Drive backup needs the repository secrets `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` (a Google OAuth client of type Desktop app, scope `drive.file`).

## Structure

- `src/` the app (SvelteKit). `src/lib/server/` database, backups, Google Drive, inbox.
- `src-tauri/` desktop shell
- `mcp/` MCP server · `figma-plugin/` Figma plugin · `site/` download page (Vercel)
