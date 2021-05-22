export type DeferredPromise<TResolve> = Promise<TResolve> & {
	/** Resolves the deferred promise with the associated value. */
	resolve: (value: PromiseLike<TResolve> | TResolve) => void;
	/** Rejects the deferred promise with the associated error. */
	reject: (reason?: unknown) => void;
};

/** Returns a promise which can be resolved/rejected on demand at a later time.  */
export function createDeferred<TResolve = unknown>( ): DeferredPromise<TResolve> {
	let resolve = null as unknown as DeferredPromise<TResolve>['resolve'];
	let reject = null as unknown as DeferredPromise<TResolve>['reject'];
	// promise executor is called immediately, so resolve/reject will be replaced before
	// this function returns and will be assigned correctly to the return value
	return Object.assign(new Promise<TResolve>((res, rej) => {
		resolve = res;
		reject = rej;
	}), { resolve, reject });
}
