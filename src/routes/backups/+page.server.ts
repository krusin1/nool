import { DATA_DIR } from '#lib/server/db.ts';
import { driveStatus } from '#lib/server/gdrive.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => ({ dataDir: DATA_DIR, drive: driveStatus() });
