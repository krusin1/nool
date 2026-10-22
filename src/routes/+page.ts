import { entries, projects } from '#lib/mock.ts';
import type { PageLoad } from './$types';

export const load: PageLoad = () => {
	return {
		projects: projects.map((project) => ({
			project,
			entries: entries.filter((e) => e.project_id === project.id)
		}))
	};
};
