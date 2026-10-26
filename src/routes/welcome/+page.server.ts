import { aiStatus, PROVIDERS } from '#lib/server/ai.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => ({ ai: aiStatus(), providers: PROVIDERS });
