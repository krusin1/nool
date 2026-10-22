import { entries, projects } from '#lib/mock.ts';
import { coverImage } from '#lib/stamp.ts';
import type { PageLoad } from './$types';

export const load: PageLoad = () => {
	return {
		projects: projects.map((project) => {
			const own = entries.filter((e) => e.project_id === project.id);
			return { project, entries: own, cover: coverImage(own) };
		})
	};
};
