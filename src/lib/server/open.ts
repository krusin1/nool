import { spawn } from 'node:child_process';

export const isDesktop = () => process.env.NOOL_DESKTOP === '1';

/**
 * Open a URL in the system browser. Only in the desktop app; in a normal browser tab
 * the page opens links itself, so this returns false.
 */
export function openExternal(url: string): Promise<boolean> {
	if (!isDesktop()) return Promise.resolve(false);
	const [cmd, args] =
		process.platform === 'win32'
			? ['rundll32', ['url.dll,FileProtocolHandler', url]]
			: process.platform === 'darwin'
				? ['open', [url]]
				: ['xdg-open', [url]];
	return new Promise((resolve) => {
		const child = spawn(cmd, args, { stdio: 'ignore', detached: true });
		child.on('error', () => resolve(false));
		child.on('spawn', () => {
			child.unref();
			resolve(true);
		});
	});
}

/** Show a file in Finder / Explorer / the file manager. Desktop app only. */
export function revealPath(path: string): Promise<boolean> {
	if (!isDesktop()) return Promise.resolve(false);
	const [cmd, args] =
		process.platform === 'win32'
			? ['explorer', [`/select,${path}`]]
			: process.platform === 'darwin'
				? ['open', ['-R', path]]
				: ['xdg-open', [path.replace(/[\\/][^\\/]*$/, '')]];
	return new Promise((resolve) => {
		const child = spawn(cmd, args, { stdio: 'ignore', detached: true });
		child.on('error', () => resolve(false));
		child.on('spawn', () => {
			child.unref();
			resolve(true);
		});
	});
}
