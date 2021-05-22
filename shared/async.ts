export type DeferredPromise<TResolve> = Promise<TResolve> & {
	/** Resolves the deferred promise with the associated value. */
	resolve: (value: PromiseLike<TResolve> | TResolve) => void;
	/** Rejects the deferred promise with the associated error. */
	reject: (reason?: unknown) => void;
};

const enum PromiseState {
	Pending = 0,
	Resolved = 1,
	Rejected = 2,
}

/** Returns a promise which can be resolved/rejected on demand at a later time.  */
export function createDeferred<TResolve = unknown>( ): DeferredPromise<TResolve> {

	// it's possible that a user will create a deferred promise and resolve/reject it synchronously
	// before the promise handler is called, in which case deferred.{resolve,reject} will be these
	// functions, which store the promise resolve value / reject reason
	let state = PromiseState.Pending;
	let value = null as unknown;
	function resolve(val: PromiseLike<TResolve> | TResolve) {
		if (state !== PromiseState.Pending) return;
		state = PromiseState.Resolved;
		value = val;
	}
	function reject(reason?: unknown) {
		if (state !== PromiseState.Pending) return;
		state = PromiseState.Rejected;
		value = reason;
	}

	const deferred: DeferredPromise<TResolve> = Object.assign(new Promise<TResolve>((
		resolve,
		reject,
	) => {
		switch (state) {
		// if the promise was resolve/rejected synchronously, immediately respect that
		case PromiseState.Resolved: return resolve(value as TResolve);
		case PromiseState.Rejected: return reject(value);
		// otherwise assign the proper resolve/reject handlers
		default:
			deferred.resolve = resolve;
			deferred.reject = reject;
		}
	}), { resolve, reject });

	return deferred;
}
