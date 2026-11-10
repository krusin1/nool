import { error } from '@sveltejs/kit';
import { exportLetter, saveToDownloads, type ExportFormat } from '#lib/server/export.ts';
import { getProject } from '#lib/server/repo/projects.ts';
import { isDesktop, openExternal, revealPath } from '#lib/server/open.ts';
import { body, ok, str } from '#lib/server/http.ts';
import type { RequestHandler } from './$types';

const format = (f: string | null): ExportFormat => (f === 'zip' ? 'zip' : 'html');

/** In a browser tab: download the export. */
export const GET: RequestHandler = async ({ params, url, fetch }) => {
	if (!getProject(params.id)) error(404, 'Project not found');
	const file = await exportLetter(params.id, url.origin, format(url.searchParams.get('format')), fetch);
	return new Response(new Uint8Array(file.body), {
		headers: { 'content-type': file.type, 'content-disposition': `attachment; filename="${file.name}"` }
	});
};

/**
 * In the desktop app, which can't download files itself: save to Downloads and show it,
 * or (format "pdf") open the print layout in the system browser to save as PDF.
 */
export const POST: RequestHandler = async ({ params, url, request, fetch }) => {
	if (!getProject(params.id)) error(404, 'Project not found');
	const f = str((await body(request)).format);
	if (f === 'pdf') return ok({ opened: await openExternal(`${url.origin}/view/${params.id}?print=1`) });
	if (!isDesktop()) error(400, 'Use the download link');
	const file = await exportLetter(params.id, url.origin, format(f), fetch);
	const path = await saveToDownloads(file.name, file.body);
	await revealPath(path);
	return ok({ path, name: file.name });
};
