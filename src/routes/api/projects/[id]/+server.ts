import { deleteProject, loadProject, updateProject } from '#lib/server/repo/projects.ts';
import { body, found, ok } from '#lib/server/http.ts';
import type { RequestHandler } from './$types';

/** The whole project, used to refresh the desk when another app added to it. */
export const GET: RequestHandler = ({ params }) => ok(found(loadProject(params.id), 'Project not found'));

export const PATCH: RequestHandler = async ({ params, request }) => {
	const b = await body(request);
	const patch: { title?: string; description?: string } = {};
	if (typeof b.title === 'string') patch.title = b.title.trim().slice(0, 200) || 'Untitled';
	if (typeof b.description === 'string') patch.description = b.description.trim().slice(0, 500);
	return ok(found(updateProject(params.id, patch)));
};

export const DELETE: RequestHandler = ({ params }) => {
	deleteProject(params.id);
	return ok();
};
