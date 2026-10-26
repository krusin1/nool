import { redirect } from '@sveltejs/kit';
import { listSummaries } from '#lib/server/repo/projects.ts';
import { getSetting } from '#lib/server/repo/settings.ts';
import type { PageServerLoad } from './$types';

// The first time Nool opens, it starts with the welcome steps.
export const load: PageServerLoad = () => {
	if (!getSetting('welcomed')) redirect(303, '/welcome');
	return { projects: listSummaries() };
};
