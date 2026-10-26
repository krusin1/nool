import { isDesktop } from '#lib/server/open.ts';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = () => ({ desktop: isDesktop() });
