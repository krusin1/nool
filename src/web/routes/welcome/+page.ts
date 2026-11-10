import { redirect } from '@sveltejs/kit';

// The preview skips the welcome steps: there is nothing to connect.
export const load = () => redirect(307, '/');
