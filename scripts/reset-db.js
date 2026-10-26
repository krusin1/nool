// Deletes the local database so the demo projects are seeded again on next start.
// Uploaded images in data/uploads are kept.
import { rmSync } from 'node:fs';
import { join } from 'node:path';

const dir = process.env.NOOL_DATA_DIR ?? join(process.cwd(), 'data');
for (const f of ['nool.db', 'nool.db-wal', 'nool.db-shm']) rmSync(join(dir, f), { force: true });
console.log('Database cleared. Start the app (npm run dev) to seed the demo projects.');
