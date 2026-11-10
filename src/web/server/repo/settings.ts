// Browser preview version of repo/settings.ts (no node:crypto).
import { db } from '../db.ts';

export function getSetting(key: string): string | undefined {
	return (db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as { value: string } | undefined)?.value;
}
export function setSetting(key: string, value: string) {
	db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').run(key, value);
}
export function deleteSetting(key: string) {
	db.prepare('DELETE FROM settings WHERE key = ?').run(key);
}
export const inboxToken = () => '';
export const rotateInboxToken = () => '';
export const checkToken = () => false;
