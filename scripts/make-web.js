// Builds the routes for the browser preview into src/routes-web: the app's pages without the
// server-only parts (+page.server.ts, endpoints), with the browser loaders from src/web/routes.
import { cpSync, rmSync, readdirSync, statSync, unlinkSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const out = 'src/routes-web';
rmSync(out, { recursive: true, force: true });
cpSync('src/routes', out, { recursive: true });
rmSync(join(out, 'api'), { recursive: true, force: true });
rmSync(join(out, 'uploads'), { recursive: true, force: true });

const walk = (dir) =>
	readdirSync(dir).forEach((f) => {
		const p = join(dir, f);
		if (statSync(p).isDirectory()) walk(p);
		else if (/^\+(page|layout)\.server\.ts$|^\+server\.ts$/.test(f)) unlinkSync(p);
	});
walk(out);
cpSync('src/web/routes', out, { recursive: true });
if (!existsSync(join(out, '+layout.ts'))) throw new Error('web layout missing');
// Server modules the pages use, copied out of lib/server (which SvelteKit keeps off the
// browser) with the browser versions of the database, uploads, settings and AI swapped in.
const lib = 'src/lib/web-server';
rmSync(lib, { recursive: true, force: true });
cpSync('src/lib/server', lib, { recursive: true });
cpSync('src/web/server', lib, { recursive: true });
console.log('Browser preview ready:', out, lib);
