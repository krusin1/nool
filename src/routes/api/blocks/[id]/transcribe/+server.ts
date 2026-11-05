import { error } from '@sveltejs/kit';
import { transcribe } from '#lib/server/ai.ts';
import { getBlock, updateBlockData } from '#lib/server/repo/blocks.ts';
import { readUpload } from '#lib/server/uploads.ts';
import { ok } from '#lib/server/http.ts';
import type { RequestHandler } from './$types';

/** Transcribe a voice note on request and save the text on the block. */
export const POST: RequestHandler = async ({ params }) => {
	const b = getBlock(params.id);
	if (!b || b.type !== 'voice') error(404, 'Voice note not found');
	const name = b.data.src.split('/').pop() ?? '';
	const file = await readUpload(name);
	if (!file) error(404, 'The recording is missing');
	try {
		const transcript = await transcribe(file.body, file.type, name);
		updateBlockData(b.id, { ...b.data, transcript });
		return ok({ transcript });
	} catch (e) {
		error(400, (e as Error).message);
	}
};
