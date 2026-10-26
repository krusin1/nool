import { join } from 'node:path';
import { inboxToken } from '#lib/server/repo/settings.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ url }) => ({
	token: inboxToken(),
	origin: url.origin,
	mcpPath: join(process.cwd(), 'mcp', 'nool-mcp.js')
});
