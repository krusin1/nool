import { join } from 'node:path';
import { aiStatus, PROVIDERS } from '#lib/server/ai.ts';
import { mcpServerEntry, mcpStatus } from '#lib/server/mcp-install.ts';
import { getSetting, inboxToken } from '#lib/server/repo/settings.ts';
import { isDesktop } from '#lib/server/open.ts';
import type { PageServerLoad } from './$types';

// The desktop app ships Node, the MCP server and the Figma plugin inside its own folder,
// so nothing needs installing. From source, they live in the project folder.
export const load: PageServerLoad = ({ url }) => {
	const res = process.env.NOOL_RESOURCES ?? process.cwd();
	return {
		token: inboxToken(),
		origin: url.origin,
		desktop: isDesktop(),
		mcpEntry: mcpServerEntry(url.origin),
		mcpApps: mcpStatus(),
		figmaManifest: join(res, 'figma-plugin', 'manifest.json'),
		ai: aiStatus(),
		providers: PROVIDERS,
		cooperhewitt: !!getSetting('cooperhewitt_key')
	};
};
