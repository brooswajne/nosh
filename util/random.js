export const DEFAULT_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
export const LENGTH_LOGGING_ID = 6;

/**
 * Generates a random integer in the specified range,
 * exclusive of upper bound.
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function generateRandomInt(min, max) {
	const random = Math.random( );
	const range = max - min;
	return Math.floor(random * range) + min;
}

/**
 * Picks a random element of the given array.
 * @template TElement
 * @param {TElement[]} array
 * @returns {TElement}
 */
export function pick(array) {
	const index = generateRandomInt(0, array.length);
	return array[ index ];
}

/**
 * Generates a random string with the specified length.
 * @param {number} length
 * @param {string} [alphabet]
 * @returns {string}
 */
export function generateRandomString(length, alphabet = DEFAULT_ALPHABET) {
	let string = '';
	while (string.length < length) {
		const character = generateRandomInt(0, alphabet.length);
		string += alphabet[ character ];
	}
	return string;
}
/** Generates a random string ID for logging purposes. */
export const generateLoggingID = ( ) => generateRandomString(LENGTH_LOGGING_ID);
