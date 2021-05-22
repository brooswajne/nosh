export const DEFAULT_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
export const LENGTH_LOGGING_ID = 6;

/** Generates a random integer in the specified range, exclusive of upper bound. */
export function generateRandomInt(min: number, max: number): number {
	const random = Math.random( );
	const range = max - min;
	return Math.floor(random * range) + min;
}

/** Picks a random element of the given array.  */
export function pick<TElement>(array: TElement[]): TElement {
	const index = generateRandomInt(0, array.length);
	return array[ index ];
}

/** Generates a random string with the specified length.  */
export function generateRandomString(
	length: number,
	alphabet: string = DEFAULT_ALPHABET,
): string {
	let string = '';
	while (string.length < length) {
		const character = generateRandomInt(0, alphabet.length);
		string += alphabet[ character ];
	}
	return string;
}

/** Generates a random string ID for logging purposes. */
export const generateLoggingID = ( ): string => generateRandomString(LENGTH_LOGGING_ID);
