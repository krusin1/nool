import { error } from '@sveltejs/kit';
import { loadProject } from '#lib/server/repo/projects.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params, url }) => {
	const data = loadProject(params.id);
	if (!data) error(404, 'Project not found');
	// ?export=1: the page as it is saved out of Nool, without the app's bar.
	return { ...data, exporting: url.searchParams.has('export'), desktop: process.env.NOOL_DESKTOP === '1' };
};
