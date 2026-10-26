// Debounced saving for inline edits, with one status the desk header can show.

type Status = 'idle' | 'saving' | 'saved' | 'error';

class Autosave {
	status = $state<Status>('idle');
	error = $state('');
	#timers = new Map<string, ReturnType<typeof setTimeout>>();
	#jobs = new Map<string, () => Promise<unknown>>();
	#inflight = 0;

	/** Run `job` after `delay` ms of quiet for this key. A newer call for the same key replaces it. */
	schedule(key: string, job: () => Promise<unknown>, delay = 600) {
		clearTimeout(this.#timers.get(key));
		this.#jobs.set(key, job);
		this.status = 'saving';
		this.#timers.set(key, setTimeout(() => this.#run(key), delay));
	}

	/** Run a save now (for discrete actions like add, delete, reorder). */
	async now<T>(job: () => Promise<T>): Promise<T> {
		this.#inflight++;
		this.status = 'saving';
		try {
			const result = await job();
			this.#settle();
			return result;
		} catch (e) {
			this.#fail(e);
			throw e;
		} finally {
			this.#inflight--;
		}
	}

	/** Drop a waiting save (the thing it would save is gone). */
	cancel(key: string) {
		clearTimeout(this.#timers.get(key));
		this.#timers.delete(key);
		this.#jobs.delete(key);
	}

	/** Save anything still waiting (before leaving the page). */
	flush() {
		for (const key of [...this.#jobs.keys()]) {
			clearTimeout(this.#timers.get(key));
			this.#run(key);
		}
	}

	get pending() {
		return this.#jobs.size > 0 || this.#inflight > 0;
	}

	async #run(key: string) {
		const job = this.#jobs.get(key);
		this.#jobs.delete(key);
		this.#timers.delete(key);
		if (!job) return;
		this.#inflight++;
		try {
			await job();
			this.#settle();
		} catch (e) {
			this.#fail(e);
		} finally {
			this.#inflight--;
		}
	}

	#settle() {
		if (!this.#jobs.size && this.#inflight <= 1) this.status = 'saved';
	}

	#fail(e: unknown) {
		this.status = 'error';
		this.error = e instanceof Error ? e.message : 'Could not save';
	}
}

export const autosave = new Autosave();
