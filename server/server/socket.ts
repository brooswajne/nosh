import type { IncomingMessage } from 'http';
import type { Socket } from 'net';

import type { Logger } from '@brooswajne/terrier';
import WebSocket from 'ws';

import {
	getChildFactory,
	logger,
} from './logger.js';
import type { LoggerChildInstance } from './logger.js';

export interface SocketConnection {
	logger: LoggerChildInstance;
}

const getSocketLogger = getChildFactory('socket');

/** Generates an ID/name for a new connection.  */
function getConnection( ): SocketConnection {
	const logger = getSocketLogger( );
	return { logger };
}

const connections = new WeakMap<WebSocket, SocketConnection>( );
const server = new WebSocket.Server({ noServer: true });
server.on('connection', function handleConnection(socket, request) {
	const connection = connections.get(socket);
	if (connection == null) {
		logger.warn('Unmatched WebSocket connection');
		socket.close( );
	} else {
		const { logger } = connection;
		logger('hello connection');
	}
});

/** Handles a request to connect to the websocket server.  */
export function connect({ request, socket, head, logger }: {
	head: Buffer;
	logger: Logger;
	request: IncomingMessage;
	socket: Socket;
}): void {
	// TODO: authentication, add user to connection object
	logger.debug('Handling upgrade');
	server.handleUpgrade(request, socket, head, function onceUpgraded(socket) {
		const connection = getConnection( );
		connections.set(socket, connection);
		logger(`-> ${connection.logger.prefix}`);
		server.emit('connection', socket, request);
	});
}
