import type {
	Readable,
	Subscriber,
	Unsubscriber,
} from 'svelte/store';

export type ReadableStore<TValue> = [
	Readable<TValue>,
	/** Updates the current value of the store. */
	(newValue: TValue) => TValue,
	/** Gets the current value of the readable store without subscribing to it. */
	( ) => TValue,
];

export function createReadableStore<TValue>(initialValue: TValue): ReadableStore<TValue> {
	let currentValue = initialValue;

	const subscriptions: Set<Subscriber<TValue>> = new Set( );
	function subscribe(subscription: Subscriber<TValue>): Unsubscriber {
		// give current value
		subscription(currentValue);
		// subscribe
		subscriptions.add(subscription);
		// logic to unsubscribe
		return ( ) => subscriptions.delete(subscription);
	}

	const store = { subscribe };
	return [ store, function set(newValue) {
		// ignore no-ops
		if (newValue === currentValue) return currentValue;

		// update the current value and notify all subscribers
		currentValue = newValue;
		for (const sub of subscriptions) sub(currentValue);
		// return updated value
		return currentValue;
	}, ( ) => currentValue ];
}
