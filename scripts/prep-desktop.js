// Prepares files the desktop app bundles:
//   build/package.json     so Node runs the server build as ES modules
//   mcp/dist/nool-mcp.mjs  the MCP server as one file (no node_modules needed)
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

writeFileSync('build/package.json', JSON.stringify({ type: 'module' }, null, 2));

if (!existsSync('mcp/node_modules')) execFileSync('npm', ['ci', '--prefix', 'mcp'], { stdio: 'inherit', shell: true });
mkdirSync('mcp/dist', { recursive: true });
execFileSync(
	'npx',
	['esbuild', 'mcp/nool-mcp.js', '--bundle', '--platform=node', '--format=esm', '--target=node22', '--outfile=mcp/dist/nool-mcp.mjs', '--minify', '--log-level=warning'],
	{ stdio: 'inherit', shell: true }
);
console.log('Desktop files ready.');
