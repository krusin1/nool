// Starts Nool's built server (copied to build/start.js). Nool always runs over plain http on
// this computer, so every request is marked http before SvelteKit works out its own address;
// otherwise it assumes https and same-origin checks, print links and sign-in redirects break.
import { createServer } from 'node:http';

process.env.PROTOCOL_HEADER = 'x-nool-proto';
const { handler } = await import('./handler.js');

const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? '127.0.0.1';
createServer((req, res) => {
	req.headers['x-nool-proto'] = 'http';
	handler(req, res);
}).listen(port, host, () => console.log(`Nool is running on http://${host === '0.0.0.0' ? 'localhost' : host}:${port}`));
