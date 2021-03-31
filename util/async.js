/**
 * @template TResolve
 * @typedef {object} DeferredPromiseResolvers
 * @property {(value?: TResolve | PromiseLike<TResolve>) => void} resolve
 * Resolves the deferred promise with the asssociated value.
 * @property {(reason?: any) => void} reject
 * Rejects the deferred promise with the associated error.
 */

/**
 * @template TResolve
 * @typedef {Promise<TResolve> & DeferredPromiseResolvers<TResolve>} DeferredPromise
 */
/**
 * Returns a promise which can be resolved/rejected on demand at a later time.
 * @template TResolve
 * @returns {DeferredPromise<TResolve>}
 */
export function createDeferred( ) {
	/** @type {DeferredPromiseResolvers<any>['resolve']} */
	let resolve = ( ) => { };
	/** @type {DeferredPromiseResolvers<any>['reject']} */
	let reject = ( ) => { };
	return Object.assign(new Promise((res, rej) => {
		resolve = res;
		reject = rej;
	}), { resolve, reject });
}
