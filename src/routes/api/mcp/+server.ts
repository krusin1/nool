import { error } from '@sveltejs/kit';
import { installMcp, mcpStatus, removeMcp, type McpAppId } from '#lib/server/mcp-install.ts';
import { body, ok, str } from '#lib/server/http.ts';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = () => ok(mcpStatus());

export const POST: RequestHandler = async ({ request, url }) => {
	try {
		return ok(installMcp(str((await body(request)).app) as McpAppId, url.origin));
	} catch (e) {
		error(400, (e as Error).message);
	}
};

export const DELETE: RequestHandler = async ({ request }) => {
	try {
		removeMcp(str((await body(request)).app) as McpAppId);
		return ok(mcpStatus());
	} catch (e) {
		error(400, (e as Error).message);
	}
};
