import { redirect } from '@sveltejs/kit';

// Connections are for the desktop app.
export const load = () => redirect(307, "/desktop");
