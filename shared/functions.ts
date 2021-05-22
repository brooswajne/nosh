/** Creates a poisoned function, which throws the given error whenever it is called. */
export function createPoisoned(error: Error | string): (...args: unknown[]) => never {
	return function poisoned( ) {
		const err = typeof error === 'string' ? new Error(error) : error;
		throw err;
	};
}
