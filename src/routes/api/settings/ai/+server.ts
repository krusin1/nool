import { error } from '@sveltejs/kit';
import { aiStatus, complete, configFrom, disconnectAi, ollamaModels, saveAi } from '#lib/server/ai.ts';
import { body, ok, str } from '#lib/server/http.ts';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => ok({ ...aiStatus(), ollama: await ollamaModels() });

/** Check the connection with a tiny request, then save it. Nothing is saved if the check fails. */
export const PUT: RequestHandler = async ({ request }) => {
	const b = await body(request);
	let config;
	try {
		config = configFrom({ provider: str(b.provider), key: str(b.key), model: str(b.model), url: str(b.url) });
		await complete('Reply with the single word: ready', 'ready?', 20, config);
	} catch (e) {
		error(400, (e as Error).message);
	}
	saveAi(config);
	return ok(aiStatus());
};

export const DELETE: RequestHandler = () => {
	disconnectAi();
	return ok(aiStatus());
};
