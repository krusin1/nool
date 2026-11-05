// Microphone recording for voice notes. Picks a format the browser can record and play back.

const TYPES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'];

export class Recorder {
	state = $state<'idle' | 'recording' | 'saving'>('idle');
	seconds = $state(0);
	error = $state('');
	#rec: MediaRecorder | null = null;
	#chunks: Blob[] = [];
	#timer: ReturnType<typeof setInterval> | undefined;
	#started = 0;

	static supported = () => typeof window !== 'undefined' && !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== 'undefined';

	async start() {
		this.error = '';
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			const type = TYPES.find((t) => MediaRecorder.isTypeSupported(t));
			this.#rec = new MediaRecorder(stream, type ? { mimeType: type } : undefined);
			this.#chunks = [];
			this.#rec.ondataavailable = (e) => e.data.size && this.#chunks.push(e.data);
			this.#rec.start(1000);
			this.#started = Date.now();
			this.seconds = 0;
			this.#timer = setInterval(() => (this.seconds = Math.floor((Date.now() - this.#started) / 1000)), 250);
			this.state = 'recording';
		} catch (e) {
			const name = (e as Error).name;
			this.error =
				name === 'NotAllowedError'
					? 'Nool needs permission to use the microphone. Allow it in your system settings and try again.'
					: name === 'NotFoundError'
						? 'No microphone found.'
						: 'Could not start recording.';
		}
	}

	/** Stop and hand back the recording, or null if it was cancelled. */
	stop(keep = true): Promise<{ file: File; duration: number } | null> {
		const rec = this.#rec;
		clearInterval(this.#timer);
		if (!rec) return Promise.resolve(null);
		return new Promise((resolve) => {
			rec.onstop = () => {
				rec.stream.getTracks().forEach((t) => t.stop());
				this.#rec = null;
				this.state = 'idle';
				if (!keep || !this.#chunks.length) return resolve(null);
				const type = (rec.mimeType || 'audio/webm').split(';')[0];
				const ext = type.includes('mp4') ? 'm4a' : type.includes('ogg') ? 'ogg' : 'weba';
				resolve({ file: new File(this.#chunks, `voice.${ext}`, { type }), duration: (Date.now() - this.#started) / 1000 });
			};
			rec.stop();
		});
	}
}

export const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
