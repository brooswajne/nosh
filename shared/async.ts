export type DeferredPromise<TResolve> = Promise<TResolve> & {
	/** Resolves the deferred promise with the associated value. */
	resolve: (value: TResolve | PromiseLike<TResolve>) => void;
	/** Rejects the deferred promise with the associated error. */
	reject: (reason?: any) => void;
}

/** Returns a promise which can be resolved/rejected on demand at a later time.  */
export function createDeferred<TResolve = unknown>( ): DeferredPromise<TResolve> {
	let resolve: DeferredPromise<TResolve>['resolve'] = ( ) => { };
	let reject: DeferredPromise<TResolve>['reject'] = ( ) => { };
	return Object.assign(new Promise<TResolve>((res, rej) => {
		resolve = res;
		reject = rej;
	}), { resolve, reject });
}
