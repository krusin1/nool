import { join } from 'node:path';
import { inboxToken } from '#lib/server/repo/settings.ts';
import { isDesktop } from '#lib/server/open.ts';
import type { PageServerLoad } from './$types';

// The desktop app ships Node, the MCP server and the Figma plugin inside its own folder,
// so nothing needs installing. From source, they live in the project folder.
export const load: PageServerLoad = ({ url }) => {
	const desktop = isDesktop();
	const res = process.env.NOOL_RESOURCES ?? process.cwd();
	return {
		token: inboxToken(),
		origin: url.origin,
		desktop,
		node: desktop ? (process.env.NOOL_NODE ?? 'node') : 'node',
		mcpPath: desktop ? join(res, 'mcp', 'nool-mcp.mjs') : join(res, 'mcp', 'nool-mcp.js'),
		figmaManifest: join(res, 'figma-plugin', 'manifest.json')
	};
};
