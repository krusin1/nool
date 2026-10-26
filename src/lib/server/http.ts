import { error, json } from '@sveltejs/kit';

/** Read a JSON body or fail with 400. */
export async function body<T = Record<string, unknown>>(request: Request): Promise<T> {
	try {
		return (await request.json()) as T;
	} catch {
		error(400, 'Expected a JSON body');
	}
}

export function found<T>(value: T | null | undefined, what = 'Not found'): T {
	if (value == null) error(404, what);
	return value;
}

export const ok = (data: unknown = { ok: true }, status = 200) => json(data, { status });

export const str = (v: unknown, fallback = '') => (typeof v === 'string' ? v : fallback);
