// Downloads the official Node.js runtime that the desktop app ships with, and puts it where
// Tauri expects a sidecar: src-tauri/binaries/node-<target-triple>[.exe]
// Usage: node scripts/fetch-node.mjs <target-triple>   (default: this machine)
import { execFileSync } from 'node:child_process';
import { mkdirSync, copyFileSync, rmSync, chmodSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const MAJOR = 24; // Node LTS line with built-in SQLite
const triple =
	process.argv[2] ??
	execFileSync('rustc', ['-vV']).toString().match(/host: (\S+)/)[1];

const platform = triple.includes('windows') ? 'win' : triple.includes('apple') ? 'darwin' : 'linux';
const arch = triple.startsWith('aarch64') ? 'arm64' : 'x64';

const index = await (await fetch('https://nodejs.org/dist/index.json')).json();
const version = index.find((r) => r.version.startsWith(`v${MAJOR}.`) && r.lts).version;
const name = `node-${version}-${platform}-${arch}`;
const file = platform === 'win' ? `${name}.zip` : `${name}.tar.gz`;
const url = `https://nodejs.org/dist/${version}/${file}`;

console.log(`Downloading ${url}`);
const work = join(tmpdir(), `nool-node-${Date.now()}`);
mkdirSync(work, { recursive: true });
const archive = join(work, file);
writeFileSync(archive, Buffer.from(await (await fetch(url)).arrayBuffer()));
execFileSync('tar', ['-xf', archive, '-C', work]);

const src = platform === 'win' ? join(work, name, 'node.exe') : join(work, name, 'bin', 'node');
const outDir = join('src-tauri', 'binaries');
mkdirSync(outDir, { recursive: true });
const out = join(outDir, `nool-node-${triple}${platform === 'win' ? '.exe' : ''}`);
copyFileSync(src, out);
if (platform !== 'win') chmodSync(out, 0o755);
rmSync(work, { recursive: true, force: true });
console.log(`Node ${version} → ${out}`);
