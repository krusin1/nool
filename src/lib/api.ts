// Small client for the desk API. Every call throws with the server's message on failure.
import type { Block, BlockDataMap, BlockType, Precedent, Project, Stage } from './types.ts';

async function call<T>(method: string, url: string, data?: unknown): Promise<T> {
	const res = await fetch(url, {
		method,
		headers: data === undefined ? undefined : { 'content-type': 'application/json' },
		body: data === undefined ? undefined : JSON.stringify(data)
	});
	if (!res.ok) {
		const msg = await res.json().then((j) => j.message).catch(() => res.statusText);
		throw new Error(msg || `Request failed (${res.status})`);
	}
	return res.json();
}

export const api = {
	createProject: (title: string, description: string, template: string) =>
		call<Project>('POST', '/api/projects', { title, description, template }),
	updateProject: (id: string, patch: Partial<Pick<Project, 'title' | 'description'>>) =>
		call<Project>('PATCH', `/api/projects/${id}`, patch),
	deleteProject: (id: string) => call('DELETE', `/api/projects/${id}`),
	post: (id: string) => call<Project>('POST', `/api/projects/${id}/post`),
	recall: (id: string) => call<Project>('DELETE', `/api/projects/${id}/post`),

	addStage: (projectId: string, name: string) => call<Stage>('POST', `/api/projects/${projectId}/stages`, { name }),
	reorderStages: (projectId: string, ids: string[]) => call('PUT', `/api/projects/${projectId}/stages`, { ids }),
	renameStage: (id: string, name: string) => call<Stage>('PATCH', `/api/stages/${id}`, { name }),
	deleteStage: (id: string) => call('DELETE', `/api/stages/${id}`),

	addBlock: <T extends BlockType>(stage_id: string, type: T, data: BlockDataMap[T]) =>
		call<Block>('POST', '/api/blocks', { stage_id, type, data }),
	updateBlock: (id: string, data: unknown) => call<Block>('PATCH', `/api/blocks/${id}`, { data }),
	deleteBlock: (id: string) => call('DELETE', `/api/blocks/${id}`),
	reorderBlocks: (stageId: string, ids: string[]) => call('PUT', `/api/stages/${stageId}/blocks`, { ids }),

	addPrecedent: (p: { stage_id: string; title: string; creator: string; year: string; url: string; note: string }) =>
		call<Precedent>('POST', '/api/precedents', p),
	updatePrecedent: (id: string, patch: { kept?: boolean; note?: string }) =>
		call<Precedent>('PATCH', `/api/precedents/${id}`, patch),
	deletePrecedent: (id: string) => call('DELETE', `/api/precedents/${id}`),

	rotateToken: () => call<{ token: string }>('POST', '/api/settings/token'),

	async upload(file: File): Promise<string> {
		const form = new FormData();
		form.append('file', file);
		const res = await fetch('/api/uploads', { method: 'POST', body: form });
		if (!res.ok) throw new Error(await res.json().then((j) => j.message).catch(() => 'Upload failed'));
		return (await res.json()).src;
	}
};
