import { redirect } from '@sveltejs/kit';

// Backups are for the desktop app.
export const load = () => redirect(307, "/desktop");
