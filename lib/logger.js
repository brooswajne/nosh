import { inspect } from 'util';

/** @typedef {import('stream').Writable} Writable */
/** @typedef {(...args: any[]) => void} LoggerMethod */
/** @typedef {(...context: string[]) => Logger} LoggerCreator */
/**
 * @typedef {object} LoggerMethods
 * @property {LoggerMethod} error
 * @property {LoggerMethod} warn
 * @property {LoggerMethod} debug
 * @property {LoggerCreator} child
 * Creates a new child logger with additional context
 */
/** @typedef {LoggerMethod & LoggerMethods} Logger */

/** Whether the logger will use colours. */
export const IS_COLOUR_SUPPORTED = process.env.COLOUR == null
	? process.stdout.isTTY
	: process.env.COLOUR === 'true';

/**
 * Different logger levels available. The higher the level, the more
 * important its messages are.
 * @enum {number}
 */
export const LOGGER_LEVEL = Object.freeze({
	DEBUG: 0,
	INFO: 10,
	WARN: 20,
	ERROR: 30,
});

/**
 * Different colours for different logger levels.
 * @enum {string}
 */
export const LOGGER_LEVEL_COLOURS = Object.freeze({
	[ LOGGER_LEVEL.ERROR ]: '\x1b[1m\x1b[31m',
	[ LOGGER_LEVEL.WARN ]: '\x1b[1m\x1b[33m',
	[ LOGGER_LEVEL.INFO ]: '\x1b[35m',
	[ LOGGER_LEVEL.DEBUG ]: '\x1b[36m',
});

export const COMPONENT_COLOURS = Object.freeze([
	'\x1b[38;5;28m',
	'\x1b[38;5;31m',
	'\x1b[38;5;172m',
	'\x1b[38;5;174m',
	'\x1b[38;5;208m',
	'\x1b[38;5;210m',
]);

const MAX_LEVEL_NAME_LENGTH = Math.max(...Object.keys(LOGGER_LEVEL).map((k) => k.length));

/** Gets the current ISO timestamp. */
const timestamp = ( ) => new Date( ).toISOString( );
/** Gets a string representation of the passed argument. */
const stringify = (/** @type {any} */ obj) => typeof obj === 'string' ? obj : inspect(obj);

/**
 * Gets a colour string which can be used for consistently colourising a
 * specific logging component.
 * @returns {string}
 */
export const getComponentColour = ( ) => COMPONENT_COLOURS[
	components++ % COMPONENT_COLOURS.length
];
let components = 0;

/**
 * Gets the name of the given logger level.
 * @param {LOGGER_LEVEL} level
 * @returns {string}
 */
export function getLevelName(level) {
	if (level >= LOGGER_LEVEL.ERROR) return 'error';
	if (level >= LOGGER_LEVEL.WARN) return 'warn';
	if (level >= LOGGER_LEVEL.INFO) return 'info';
	if (level >= LOGGER_LEVEL.DEBUG) return 'debug';
	throw new TypeError(`Invalid logger level: ${level}`);
}

/** Gets the logged string for a timestamp. */
function getTimestampString( ) {
	const time = timestamp( );
	return IS_COLOUR_SUPPORTED ? `\x1b[2m${time}\x1b[0m` : time;
}
/**
 * Gets the logged string for a given logger level.
 * @param {LOGGER_LEVEL} level
 * @returns {string}
 */
function getLevelString(level) {
	const name = getLevelName(level).padEnd(MAX_LEVEL_NAME_LENGTH, ' ');
	const colour = LOGGER_LEVEL_COLOURS[ level ];
	return IS_COLOUR_SUPPORTED ? `${colour}${name}\x1b[0m` : name;
}

/**
 * Creates a new logger
 * @param {object} config
 * @param {Writable} config.outStream
 * @param {Writable} [config.errStream]
 * @param {LOGGER_LEVEL} [config.level]
 * @returns {Logger}
 */
export function createLogger({
	outStream,
	errStream = outStream,
	level = LOGGER_LEVEL.DEBUG,
}) {
	/**
	 * @param {object} config
	 * @param {Writable} config.targetStream
	 * @param {LOGGER_LEVEL} config.targetLevel
	 * @param {string[]} config.context
	 * @returns {LoggerMethod}
	 */
	const method = ({
		targetStream,
		targetLevel,
		context,
	}) => function log(...args) {
		if (targetLevel < level) return;
		const message = [
			getTimestampString( ),
			getLevelString(targetLevel),
			...context,
			...args.map(stringify),
		].join(' ');
		targetStream.write(`${message}\n`);
	};

	return (function createChild(/** @type {string[]} */ context) {
		const child = method({
			targetStream: outStream,
			targetLevel: LOGGER_LEVEL.INFO,
			context: context,
		});
		return Object.assign(child, {
			error: method({
				targetStream: errStream,
				targetLevel: LOGGER_LEVEL.ERROR,
				context: context,
			}),
			warn: method({
				targetStream: errStream,
				targetLevel: LOGGER_LEVEL.WARN,
				context: context,
			}),
			debug: method({
				targetStream: outStream,
				targetLevel: LOGGER_LEVEL.DEBUG,
				context: context,
			}),
			/** @param {string[]} ctx*/
			child: (...ctx) => createChild(context.concat(ctx)),
		});
	})([ ]);
}

/** The default logger. */
export const logger = createLogger({
	outStream: process.stdout,
	errStream: process.stderr,
	level: LOGGER_LEVEL.DEBUG,
});
