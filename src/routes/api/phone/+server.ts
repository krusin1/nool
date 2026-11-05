import { newPhoneKey, phoneStatus, setPhone, startPhone, stopPhone } from '#lib/server/phone.ts';
import { body, ok } from '#lib/server/http.ts';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => ok(await phoneStatus());

/** { on: boolean } switches phone capture; { newKey: true } unpairs every phone. */
export const PUT: RequestHandler = async ({ request }) => {
	const b = await body(request);
	if (b.newKey === true) {
		newPhoneKey();
		stopPhone();
		await startPhone();
	}
	if (typeof b.on === 'boolean') await setPhone(b.on);
	return ok(await phoneStatus());
};
