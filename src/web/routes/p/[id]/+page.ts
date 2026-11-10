import { error } from '@sveltejs/kit';
import { loadProject } from '#lib/server/repo/projects.ts';

export const load = ({ params }: { params: { id: string } }) => {
	const data = loadProject(params.id);
	if (!data) error(404, 'Project not found');
	return { ...data, ai: false, speech: false };
};
