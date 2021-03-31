/**
 * Creates a poisoned function, which throws the given error
 * whenever it is called.
 * @param {Error | string} error
 * @returns {( ) => any}
 */
export const createPoisoned = (error) => function poisoned( ) {
	const err = typeof error === 'string' ? new Error(error) : error;
	throw err;
};
