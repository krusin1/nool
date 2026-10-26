import { listSummaries } from '#lib/server/repo/projects.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => ({ projects: listSummaries() });
