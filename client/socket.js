import { SOCKET_PATH } from '../util/socket.js';
import { createDeferred } from '../util/async.js';
import { createReadableStore } from '../client/util.js';

const AUTO_RECONNECT_DELAY_INITIAL = 1000;
const AUTO_RECONNECT_DELAY_SCALING = 1.5;
const AUTO_RECONNECT_DELAY_MAX = 60000;

export const SOCKET_URL = `ws://${location.host}${SOCKET_PATH}`;

const [
	/** The current reconnection delay for the WebSocket client. */
	autoReconnectDelay,
	setAutoReconnectDelay,
	getAutoReconnectDelay,
] = createReadableStore(AUTO_RECONNECT_DELAY_INITIAL);
export { autoReconnectDelay };

const [
	/** Whether the WebSocket client is currently connected to the server. */
	isConnected,
	setIsConnected,
	// getIsConnected,
] = createReadableStore(false);
export { isConnected };

/** @type {WebSocket | null} */
let connection = null;

/** @returns {Promise<void>} */
function reconnect( ) {
	const socket = new WebSocket(SOCKET_URL);
	const promise = createDeferred( );
	function onceConnected( ) {
		promise.resolve( );
		setIsConnected(true);
		setAutoReconnectDelay(AUTO_RECONNECT_DELAY_INITIAL);
	}
	function onceDisconnected( ) {
		// reconnect
		const delay = getAutoReconnectDelay( );
		setIsConnected(false);
		setTimeout(reconnect, delay);
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
export function connect( ) {
	if (connection != null) throw new Error('WebSocket connection already initialized');
	else return reconnect( );
}
