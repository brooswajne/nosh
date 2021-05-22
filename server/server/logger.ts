import {
	createColor,
	createLogger,
} from '@brooswajne/terrier';
import type { Logger } from '@brooswajne/terrier';
import { generateLoggingID } from 'shared/dist/random.js';

export type LoggerChild = Logger & { prefix: string };
export type LoggerChildInstance = LoggerChild & { id: string };
export type LoggerChildFactory = ( ) => LoggerChildInstance;

export const COMPONENT_COLOURS = Object.freeze([
	createColor('38;5;28'),
	createColor('38;5;31'),
	createColor('38;5;172'),
	createColor('38;5;174'),
	createColor('38;5;208'),
	createColor('38;5;210'),
]);

let numComponents = 0;

/** The nosh root logger. */
export const logger = createLogger( );

/** Gets a child logger of the given terrier logger instance. */
export function getChildComponent(name: string, parent = logger): LoggerChild {
	const number = numComponents++;
	const colour = COMPONENT_COLOURS[ number % COMPONENT_COLOURS.length ];
	const prefix = colour(name);
	return Object.assign(parent.child(prefix), { prefix });
}
/**
 * Gets a child logger factory of the given terrier logger instance, which when called creates a
 * child logger with a unique ID.
 */
export function getChildFactory(name: string, parent = logger): LoggerChildFactory {
	const number = numComponents++;
	const colour = COMPONENT_COLOURS[ number % COMPONENT_COLOURS.length ];
	return function getChild( ) {
		const id = generateLoggingID( );
		const prefix = colour(`${name}:${id}`);
		return Object.assign(parent.child(prefix), { prefix, id });
	};
}
