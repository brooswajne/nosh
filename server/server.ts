import {
	dirname,
	extname,
	join,
} from 'path';
import { createServer } from 'http';

import {
	RouteType,
	initializeRoutes,
	serve,
} from '@brooswajne/poodle';
import type { RouteHandlers } from '@brooswajne/poodle';
import { SOCKET_PATH } from 'shared/dist/socket.js';

import {
	getRequestContext,
	getRequestLogger,
} from './server/request.js';
import type { RequestContext } from './server/request.js';
import { connect } from './server/socket.js';
import { logger } from './server/logger.js';

const DIR_HERE = dirname(import.meta.url.slice('file:'.length));
const DIR_ROUTES = join(DIR_HERE, './routes');
const DIR_CLIENT = join(DIR_HERE, '../../client/dist'); // TODO: better way of doing this

const DEFAULT_HOST = '127.0.0.1';
const DEFAULT_PORT = 4000;

const HOST = String(process.env.HOST || DEFAULT_HOST);
const PORT = Number(process.env.PORT || DEFAULT_PORT);

const STATUS_CODE_BAD = 400;

(async function startServer( ) {
	const routes: RouteHandlers = new Map( );

	logger.debug('Initializing static server routes...');
	await initializeRoutes(DIR_CLIENT, {
		routes: routes,
		getRouteType: ( ) => RouteType.Static,
		onRouteAdded: ({ method, path }) => logger.trace(`- Initialized: ${method} ${path}`),
	});
	logger.debug('Initializing custom server routes...');
	await initializeRoutes(DIR_ROUTES, {
		routes: routes,
		getRouteType: (file) => extname(file) === '.js' ? RouteType.Dynamic : RouteType.Ignored,
		onRouteAdded: ({ method, path }) => logger.trace(`- Initialized: ${method} ${path}`),
	});

	logger.debug('Initializing server...');
	const server = serve<RequestContext>(routes, {
		server: createServer({ }),
		getRequestContext: getRequestContext,
		onErrorHandling: ({ logger }, error) => logger.error('Error handling request:', error),
		onErrorWriting: ({ logger }, error) => logger.error('Error writing response:', error),
		onResponded: function logResponseTime({ request, logger, timestamp }, response) {
			const status = response.statusCode;
			const isSuccess = status < STATUS_CODE_BAD;

			const duration = Date.now( ) - timestamp;
			const message = `${request.method} ${request.url}: ${status} (${duration}ms)`;

			if (isSuccess) logger.info(message);
			else logger.warn(message);
		},
	});

	logger.debug('Initializing WebSocket server...');
	server.on('upgrade', function handleUpgrade(req, socket, head) {
		const logger = getRequestLogger( );
		logger.debug(`UPGRADE ${req.url}`);

		const isPathAllowed = req.url === SOCKET_PATH;
		if (!isPathAllowed) {
			logger.warn('Path rejected');
			socket.destroy( );
		} else connect({
			head: head,
			logger: logger,
			request: req,
			socket: socket,
		});
	});

	logger.debug(`Starting server at ${HOST}:${PORT}...`);
	server.listen(PORT, HOST, function onceListening( ) {
		// @ts-expect-error - checking that the address is correct isn't worth the trouble
		const { address, port } = server.address( );
		logger(`Server started on ${address}:${port}`);
	});
})( ).catch(function handleStartupError(err) {
	logger.fatal('Error starting server:', err);
	// TODO: abstract this startup logic and create a start.script.js?
	// eslint-disable-next-line no-process-exit -- this is the startup script
	process.exit(1);
});
