import adapterNode from '@sveltejs/adapter-node';
import adapterStatic from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, type Plugin } from 'vite';

// `vite build --mode web` builds the browser preview (npm run build:web): the same app, with its
// database in the visitor's browser and no server. See src/web.

// In the preview, anything under src/lib/server comes from src/lib/web-server instead
// (made by scripts/make-web.js), so it can run in the browser.
const swap = (): Plugin => ({
	name: 'nool-web-swap',
	enforce: 'pre',
	async resolveId(source, importer, options) {
		const r = await this.resolve(source, importer, { ...options, skipSelf: true });
		if (!r) return null;
		const id = r.id.replace(/\\/g, '/');
		return id.includes('/src/lib/server/') ? id.replace('/src/lib/server/', '/src/lib/web-server/') : null;
	}
});

export default defineConfig(({ mode }) => {
	const web = mode === 'web';
	return {
	plugins: [
		...(web ? [swap()] : []),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
			},
			// Nool checks origins itself (hooks.server.ts): desk API writes must be same-origin, and the
			// inbox takes any origin with its token, so scripts and plugins can upload files.
			csrf: { trustedOrigins: ['*'] },
			adapter: web ? adapterStatic({ pages: 'build-web', assets: 'build-web', fallback: 'index.html' }) : adapterNode(),
			...(web ? { files: { routes: 'src/routes-web', hooks: { client: 'src/web/hooks.client.ts', server: 'src/web/hooks.server.ts' } } } : {})
		})
	],
	...(web ? { build: { target: 'es2022' }, optimizeDeps: { exclude: ['sql.js'] } } : {})
};
});
