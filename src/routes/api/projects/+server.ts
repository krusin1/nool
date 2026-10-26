import { createProject } from '#lib/server/repo/projects.ts';
import { body, ok, str } from '#lib/server/http.ts';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const b = await body(request);
	return ok(createProject({ title: str(b.title), description: str(b.description), template: str(b.template) }), 201);
};
