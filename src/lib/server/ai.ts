import { deleteSetting, getSetting, setSetting } from './repo/settings.ts';

// The maker's own AI connection. Nothing runs unless they connect one and press a button.
// The key is stored in the local database on this computer and is only sent to the provider they chose.

export type ProviderId = 'anthropic' | 'openai' | 'gemini' | 'openrouter' | 'ollama' | 'custom';

export interface Provider {
	id: ProviderId;
	name: string;
	hint: string;
	keyUrl: string | null; // where to get a key
	needsKey: boolean;
	needsUrl: boolean;
	defaultModel: string;
	defaultUrl: string;
}

export const PROVIDERS: Provider[] = [
	{ id: 'anthropic', name: 'Claude', hint: 'Anthropic', keyUrl: 'https://console.anthropic.com/settings/keys', needsKey: true, needsUrl: false, defaultModel: 'claude-sonnet-5-5', defaultUrl: 'https://api.anthropic.com' },
	{ id: 'openai', name: 'ChatGPT', hint: 'OpenAI', keyUrl: 'https://platform.openai.com/api-keys', needsKey: true, needsUrl: false, defaultModel: 'gpt-5-mini', defaultUrl: 'https://api.openai.com/v1' },
	{ id: 'gemini', name: 'Gemini', hint: 'Google', keyUrl: 'https://aistudio.google.com/apikey', needsKey: true, needsUrl: false, defaultModel: 'gemini-2.5-flash', defaultUrl: 'https://generativelanguage.googleapis.com/v1beta/openai' },
	{ id: 'openrouter', name: 'OpenRouter', hint: 'Many models, one key', keyUrl: 'https://openrouter.ai/keys', needsKey: true, needsUrl: false, defaultModel: 'anthropic/claude-sonnet-4.5', defaultUrl: 'https://openrouter.ai/api/v1' },
	{ id: 'ollama', name: 'Ollama', hint: 'Free, runs on this computer', keyUrl: 'https://ollama.com/download', needsKey: false, needsUrl: false, defaultModel: 'llama3.2', defaultUrl: 'http://127.0.0.1:11434/v1' },
	{ id: 'custom', name: 'Other', hint: 'Any OpenAI-compatible service', keyUrl: null, needsKey: false, needsUrl: true, defaultModel: '', defaultUrl: '' }
];

interface Config {
	provider: ProviderId;
	key: string;
	model: string;
	url: string;
}

const load = (): Config | null => {
	const raw = getSetting('ai');
	return raw ? JSON.parse(raw) : null;
};

export const aiConnected = () => !!load();

/** What the page may see. Never the key itself. */
export function aiStatus() {
	const c = load();
	if (!c) return { connected: false as const };
	const p = PROVIDERS.find((x) => x.id === c.provider)!;
	return { connected: true as const, provider: c.provider, name: p.name, model: c.model, url: c.url, keyEnd: c.key ? c.key.slice(-4) : '' };
}

export function configFrom(input: { provider: string; key?: string; model?: string; url?: string }): Config {
	const p = PROVIDERS.find((x) => x.id === input.provider);
	if (!p) throw new Error('Pick a provider.');
	const prev = load();
	// Keep the saved key when only the model changes.
	const key = (input.key ?? '').trim() || (prev?.provider === p.id ? prev.key : '');
	const url = (input.url ?? '').trim().replace(/\/+$/, '') || p.defaultUrl;
	if (p.needsKey && !key) throw new Error(`Paste your ${p.name} key.`);
	if (!/^https?:\/\//.test(url)) throw new Error('The address should start with http:// or https://');
	const model = (input.model ?? '').trim() || p.defaultModel;
	if (!model) throw new Error('Enter a model name.');
	return { provider: p.id, key, model, url };
}

export const saveAi = (c: Config) => setSetting('ai', JSON.stringify(c));
export const disconnectAi = () => deleteSetting('ai');

/** One request, plain text back. */
export async function complete(system: string, user: string, maxTokens = 800, c = load()): Promise<string> {
	if (!c) throw new Error('Connect an AI model first, in Connections.');
	const signal = AbortSignal.timeout(90_000);
	try {
		if (c.provider === 'anthropic') {
			const res = await fetch(`${c.url}/v1/messages`, {
				method: 'POST',
				signal,
				headers: { 'content-type': 'application/json', 'x-api-key': c.key, 'anthropic-version': '2023-06-01' },
				body: JSON.stringify({ model: c.model, max_tokens: maxTokens, system, messages: [{ role: 'user', content: user }] })
			});
			const j = await res.json().catch(() => ({}));
			if (!res.ok) throw new Error(j.error?.message ?? `Claude returned ${res.status}`);
			return (j.content ?? []).map((b: { text?: string }) => b.text ?? '').join('').trim();
		}
		const res = await fetch(`${c.url}/chat/completions`, {
			method: 'POST',
			signal,
			headers: { 'content-type': 'application/json', ...(c.key ? { authorization: `Bearer ${c.key}` } : {}) },
			body: JSON.stringify({
				model: c.model,
				max_tokens: maxTokens,
				messages: [
					{ role: 'system', content: system },
					{ role: 'user', content: user }
				]
			})
		});
		const j = await res.json().catch(() => ({}));
		const err = Array.isArray(j) ? j[0]?.error : j.error;
		if (!res.ok) throw new Error(err?.message ?? (typeof err === 'string' ? err : `The model returned ${res.status}`));
		return (j.choices?.[0]?.message?.content ?? '').trim();
	} catch (e) {
		const msg = (e as Error).message;
		if ((e as Error).name === 'TimeoutError') throw new Error('The model took too long to answer.');
		if (c.provider === 'ollama' && /fetch failed|ECONNREFUSED/.test(msg)) throw new Error('Ollama is not running. Open the Ollama app and try again.');
		if (/fetch failed/.test(msg)) throw new Error('Could not reach the model. Check your internet connection.');
		throw e;
	}
}

/** Pull a JSON value out of a model reply, tolerating code fences and chatter. */
export function parseJson<T>(text: string): T | null {
	const m = text.match(/```(?:json)?\s*([\s\S]*?)```/) ?? text.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
	try {
		return JSON.parse(m ? m[1] : text) as T;
	} catch {
		return null;
	}
}

/** Ollama models installed on this computer, if Ollama is running. */
export async function ollamaModels(): Promise<string[]> {
	try {
		const res = await fetch('http://127.0.0.1:11434/api/tags', { signal: AbortSignal.timeout(1500) });
		const j = await res.json();
		return (j.models ?? []).map((m: { name: string }) => m.name);
	} catch {
		return [];
	}
}
