import { error } from '@sveltejs/kit';
import { loadProject } from '#lib/server/repo/projects.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) => {
	const data = loadProject(params.id);
	if (!data) error(404, 'Project not found');
	return data;
};
