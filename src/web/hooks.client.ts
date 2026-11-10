// Browser preview start-up: open the browser database, add the sample projects the
// first time, and answer the app's API calls in the page.
import type { ClientInit } from '@sveltejs/kit/hooks';
import { install } from './api.ts';
import { seedIfEmpty } from '../lib/server/seed.ts';
import { setSetting } from '../lib/server/repo/settings.ts';

export const init: ClientInit = () => {
	seedIfEmpty();
	setSetting('welcomed', 'preview');
	install();
};
