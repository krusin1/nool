// Browser preview: images and recordings are kept inside the project as data URLs,
// so they live in the same browser database as everything else.
export const MAX_UPLOAD = 8 * 1024 * 1024;
export const MAX_AUDIO = 12 * 1024 * 1024;

export async function saveUpload(file: File): Promise<string> {
	const ok = file.type.startsWith('image/') || file.type.startsWith('audio/');
	if (!ok) throw new Error('Only images and audio can be added.');
	const audio = file.type.startsWith('audio/');
	if (file.size > (audio ? MAX_AUDIO : MAX_UPLOAD))
		throw new Error(`In the browser preview, ${audio ? 'recordings' : 'images'} must be ${audio ? 12 : 8} MB or smaller. The desktop app takes larger files.`);
	return await new Promise((resolve, reject) => {
		const r = new FileReader();
		r.onload = () => resolve(r.result as string);
		r.onerror = () => reject(new Error('Could not read that file.'));
		r.readAsDataURL(file);
	});
}
export const saveBytes = () => Promise.reject(new Error('Not in the browser preview'));
export const readUpload = async () => null;
