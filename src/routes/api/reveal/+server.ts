import { error } from '@sveltejs/kit';
import { join } from 'node:path';
import { revealPath } from '#lib/server/open.ts';
import { body, ok, str } from '#lib/server/http.ts';
import type { RequestHandler } from './$types';

// Only Nool's own bundled files can be shown, never an arbitrary path.
const FILES: Record<string, string[]> = { figma: ['figma-plugin', 'manifest.json'] };

export const POST: RequestHandler = async ({ request }) => {
	const parts = FILES[str((await body(request)).what)];
	if (!parts) error(400, 'Unknown file');
	return ok({ opened: await revealPath(join(process.env.NOOL_RESOURCES ?? process.cwd(), ...parts)) });
};
