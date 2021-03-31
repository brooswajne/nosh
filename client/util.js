/**
 * @template TValue
 * @typedef {import('svelte/store').Readable<TValue>} ReadableStore
 */
/**
 * Creates a simple svelte readable store.
 * @template TValue
 * @param {TValue} initialValue
 * @returns {[
 *   ReadableStore<TValue>,
 *   (newValue: TValue) => void,
 *   ( ) => TValue,
 * ]}
 */
export function createReadableStore(initialValue) {
	let currentValue = initialValue;

	/** @type {Set<(newValue: TValue) => void>} */
	const subscriptions = new Set( );
	/** @type {ReadableStore<TValue>['subscribe']} */
	function subscribe(subscription) {
		// give current value
		subscription(currentValue);
		// subscribe
		subscriptions.add(subscription);
		// unsubscribe
		return ( ) => subscriptions.delete(subscription);
	}

	const store = { subscribe };
	return [ store, function set(newValue) {
		if (newValue === currentValue) return;
		currentValue = newValue;
		for (const sub of subscriptions) sub(currentValue);
	}, ( ) => currentValue ];
}
