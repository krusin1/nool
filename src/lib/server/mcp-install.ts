import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { isDesktop } from './open.ts';
import { inboxToken } from './repo/settings.ts';

// One-click setup for MCP apps: Nool writes its entry into the app's own config file,
// after saving a copy of the original next to it.

export type McpAppId = 'claude' | 'cursor' | 'windsurf';

const home = homedir();
const appData = process.env.APPDATA ?? join(home, 'AppData', 'Roaming');

function claudeConfig(): string {
	if (process.platform === 'darwin') return join(home, 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json');
	if (process.platform === 'win32') {
		// The Microsoft Store version keeps its config inside its package folder.
		const pkgs = join(home, 'AppData', 'Local', 'Packages');
		const store = existsSync(pkgs) ? readdirSync(pkgs).find((d) => d.startsWith('Claude_')) : undefined;
		const storePath = store && join(pkgs, store, 'LocalCache', 'Roaming', 'Claude', 'claude_desktop_config.json');
		if (storePath && existsSync(dirname(storePath))) return storePath;
		return join(appData, 'Claude', 'claude_desktop_config.json');
	}
	return join(home, '.config', 'Claude', 'claude_desktop_config.json');
}

export const MCP_APPS: { id: McpAppId; name: string; path: () => string; restart: string }[] = [
	{ id: 'claude', name: 'Claude Desktop', path: claudeConfig, restart: 'Quit Claude fully and open it again.' },
	{ id: 'cursor', name: 'Cursor', path: () => join(home, '.cursor', 'mcp.json'), restart: 'Restart Cursor.' },
	{ id: 'windsurf', name: 'Windsurf', path: () => join(home, '.codeium', 'windsurf', 'mcp_config.json'), restart: 'Restart Windsurf.' }
];

export function mcpServerEntry(origin: string) {
	const res = process.env.NOOL_RESOURCES ?? process.cwd();
	const desktop = isDesktop();
	return {
		command: desktop ? (process.env.NOOL_NODE ?? 'node') : 'node',
		args: [desktop ? join(res, 'mcp', 'nool-mcp.mjs') : join(res, 'mcp', 'nool-mcp.js')],
		env: { NOOL_URL: origin, NOOL_TOKEN: inboxToken() }
	};
}

function read(path: string): Record<string, unknown> {
	if (!existsSync(path)) return {};
	const raw = readFileSync(path, 'utf8').trim();
	if (!raw) return {};
	try {
		return JSON.parse(raw);
	} catch {
		throw new Error(`The config file has a mistake in it, so Nool left it alone. Fix or empty it, then try again: ${path}`);
	}
}

export function mcpStatus() {
	return MCP_APPS.map((a) => {
		const path = a.path();
		let installed = false;
		try {
			installed = !!(read(path).mcpServers as Record<string, unknown> | undefined)?.nool;
		} catch {
			/* broken file: shown as not installed */
		}
		// The app counts as present if its config folder exists.
		return { id: a.id, name: a.name, path, found: existsSync(dirname(path)), installed, restart: a.restart };
	});
}

export function installMcp(id: McpAppId, origin: string) {
	const app = MCP_APPS.find((a) => a.id === id);
	if (!app) throw new Error('Unknown app');
	const path = app.path();
	const config = read(path);
	if (existsSync(path)) copyFileSync(path, `${path}.before-nool`);
	else mkdirSync(dirname(path), { recursive: true });
	config.mcpServers = { ...((config.mcpServers as object) ?? {}), nool: mcpServerEntry(origin) };
	writeFileSync(path, JSON.stringify(config, null, 2));
	return { path, restart: app.restart };
}

export function removeMcp(id: McpAppId) {
	const app = MCP_APPS.find((a) => a.id === id);
	if (!app) throw new Error('Unknown app');
	const path = app.path();
	const config = read(path);
	const servers = config.mcpServers as Record<string, unknown> | undefined;
	if (!servers?.nool) return;
	delete servers.nool;
	writeFileSync(path, JSON.stringify(config, null, 2));
}
