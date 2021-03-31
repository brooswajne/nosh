import WebSocket from 'ws';

import { generateLoggingID } from '../util/random.js';

import {
	IS_COLOUR_SUPPORTED,
	getComponentColour,
	logger,
} from './logger.js';

/** @typedef {import('http').IncomingMessage} Request */
/** @typedef {import('net').Socket} Socket */
/** @typedef {import('./logger').Logger} Logger */
/**
 * @typedef {object} SocketConnection
 * @property {string} id
 * @property {string} name
 * @property {Logger} logger
 */

const COLOUR_SOCKET = getComponentColour( );

/**
 * Generates an ID/name for a new connection.
 * @returns {SocketConnection}
 */
function getConnection( ) {
	const id = generateLoggingID( );
	const name = IS_COLOUR_SUPPORTED
		? `${COLOUR_SOCKET}socket:${id}\x1b[0m`
		: `socket:${id}`;
	const log = logger.child(name);
	return {
		id: id,
		name: name,
		logger: log,
	};
}

/** @type {Map<WebSocket, SocketConnection>} */
const connections = new WeakMap( );
const server = new WebSocket.Server({ noServer: true });
server.on('connection', function handleConnection(socket, request) {
	const connection = connections.get(socket);
	if (connection == null) {
		logger.warn('Unmatched WebSocket connection');
		socket.close( );
	} else {
		const { logger } = connection;
	}
});

/**
 * Handles a request to connect to the websocket server.
 * @param {object} connection
 * @param {Request} connection.request
 * @param {Socket} connection.socket
 * @param {Buffer} connection.head
 * @param {Logger} connection.logger
 */
export function connect({ request, socket, head, logger }) {
	// TODO: authentication, add user to connection object
	logger.debug('Upgrading...');
	server.handleUpgrade(request, socket, head, function onceUpgraded(socket) {
		const connection = getConnection( );
		connections.set(socket, connection);
		logger(`-> ${connection.name}`);
		server.emit('connection', socket, request);
	});
}
