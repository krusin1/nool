import { error } from '@sveltejs/kit';
import { getProject } from '#lib/mock.ts';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	const data = getProject(params.id);
	if (!data) error(404, 'Project not found');
	return data;
};
