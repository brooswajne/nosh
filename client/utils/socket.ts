import { SOCKET_PATH } from 'shared/dist/socket.js';
import { createDeferred } from 'shared/dist/async.js';

import { createReadableStore } from './svelte.js';

const AUTO_RECONNECT_DELAY_INITIAL = 1000;
const AUTO_RECONNECT_DELAY_SCALING = 1.5;
const AUTO_RECONNECT_DELAY_MAX = 60000;

export const SOCKET_URL = `ws://${location.host}${SOCKET_PATH}`;

const [
	autoReconnectDelay,
	setAutoReconnectDelay,
	getAutoReconnectDelay,
] = createReadableStore(AUTO_RECONNECT_DELAY_INITIAL);

const [
	isConnected,
	setIsConnected,
	// getIsConnected,
] = createReadableStore(false);

export {
	/** The current reconnection delay for the WebSocket client. */
	autoReconnectDelay,
	/** Whether the WebSocket client is currently connected to the server. */
	isConnected,
};

let connection: WebSocket | null = null;

function reconnect( ): Promise<null> {
	const socket = new WebSocket(SOCKET_URL);
	const promise = createDeferred<null>( );

	function onceConnected( ) {
		promise.resolve(null);
		setIsConnected(true);
		// reset reconnect delay as we connected successfully
		setAutoReconnectDelay(AUTO_RECONNECT_DELAY_INITIAL);
	}
	function onceDisconnected( ) {
		setIsConnected(false);

		// reconnect after the current delay
		const delay = getAutoReconnectDelay( );
		setTimeout(reconnect, delay);
		// increase the delay for next time
		setAutoReconnectDelay(Math.min(
			delay * AUTO_RECONNECT_DELAY_SCALING,
			AUTO_RECONNECT_DELAY_MAX,
		));

		socket.removeEventListener('open', onceConnected);
		socket.removeEventListener('close', onceDisconnected);
	}

	socket.addEventListener('open', onceConnected);
	socket.addEventListener('close', onceDisconnected);

	connection = socket;
	return promise;
}
/** Initiates the WebSocket connection.  */
export function connect( ): Promise<null> {
	if (connection != null) throw new Error('WebSocket connection already initialized');
	else return reconnect( );
}
