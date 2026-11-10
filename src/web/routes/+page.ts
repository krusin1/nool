import { listSummaries } from '#lib/server/repo/projects.ts';

export const load = () => ({ projects: listSummaries() });
