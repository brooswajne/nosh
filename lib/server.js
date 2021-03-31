import {
	METHODS,
	createServer,
} from 'http';
import {
	basename,
	dirname,
	extname,
	join,
	relative,
} from 'path';

import { SOCKET_PATH } from '../util/socket.js';
import { generateLoggingID } from '../util/random.js';
import { traverse } from '../util/files.js';

import {
	IS_COLOUR_SUPPORTED,
	getComponentColour,
	logger,
} from './logger.js';
import {
	Response,
	file,
} from './responses.js';
import { connect } from './socket.js';

/** @typedef {import('http').IncomingMessage} Request */
/** @typedef {import('./logger').Logger} Logger */
/**
 * @typedef {object} RequestContext
 * @property {Request} context.request
 * @property {Logger} context.logger
 */
/** @typedef {(context: RequestContext) => Promise<Response>} RequestHandler */
/** @typedef {Map<string, RequestHandler>} MethodHandlers */
/** @typedef {Map<string, MethodHandlers>} RouteHandlers */

const COLOUR_REQUEST = getComponentColour( );

const DIR_HERE = dirname(import.meta.url.slice('file:'.length));
const DIR_ROOT = join(DIR_HERE, '../');
const DIR_DIST = join(DIR_ROOT, './dist');
const DIR_ROUTES = join(DIR_HERE, './server');

const DEFAULT_HOST = '127.0.0.1';
const DEFAULT_PORT = 4000;

const HOST = String(process.env.HOST || DEFAULT_HOST);
const PORT = Number(process.env.PORT || DEFAULT_PORT);

function getRequestLogger( ) {
	const id = generateLoggingID( );
	if (!IS_COLOUR_SUPPORTED) return logger.child(`request:${id}`);
	return logger.child(`${COLOUR_REQUEST}request:${id}\x1b[0m`);
}

(async function startServer( ) {
	/** @type {RouteHandlers} */
	const routes = new Map( );

	logger.debug('Initializing static server routes...');
	await traverse(DIR_DIST, async function initializeRoute(filepath) {
		const path = relative(DIR_DIST, filepath);

		const route = `/${path}`;
		/** @type {MethodHandlers} */
		const methods = new Map( );
		methods.set('GET', async function serveStatic({ logger }) {
			logger.debug('Serving static file:', path);
			return file(filepath);
		});
		routes.set(route, methods);
		logger.debug(`- Initialized: GET ${route}`);
	});

	logger.debug('Initializing custom server routes...');
	await traverse(DIR_ROUTES, async function initializeRoute(filepath) {
		const extension = extname(filepath);
		if (extension !== '.js') return;

		const name = basename(filepath, extension);
		const path = relative(DIR_ROUTES, dirname(filepath));

		const route = `/${join(path, name)}`;
		/** @type {MethodHandlers} */
		const methods = new Map( );
		routes.set(route, methods);

		const handlers = await import(filepath);
		for (const method in handlers) {
			const handler = handlers[ method ];
			const isKnown = METHODS.includes(method);
			if (!isKnown) continue;
			methods.set(method, handler);
			logger.debug(`- Initialized: ${method} ${route}`);
		}
	});

	logger.debug('Initializing server...');
	const server = createServer({ });
	server.on('request', function handleRequest(
		/** @type {Request} */ req,
		/** @type {import('http').ServerResponse} */ res,
	) {
		if (!req.url) return logger.warn('Request with no url, ignoring');
		if (!req.method) return logger.warn('Request with no method, ignoring');

		const log = getRequestLogger( );

		log(`${req.method} ${req.url}`);
		const start = Date.now( );
		res.once('finish', function onceResponded( ) {
			const end = Date.now( );
			const time = end - start;
			const code = res.statusCode;

			const size = res.getHeader('Content-Length');
			const stats = size != null ? `[${time}ms / ${size}B]` : `[${time}ms]`;
			log(`${req.method} ${req.url} - ${code} ${stats}`);
		});

		const route = req.url === '/' ? '/index' : req.url;
		const handlers = routes.get(route);

		if (handlers == null) return res
			.writeHead(404, { 'Content-Type': 'text/plain' })
			.end('Not found');

		const method = req.method;
		const handler = handlers.get(method);
		if (handler == null) return res
			.writeHead(404, { 'Content-Type': 'text/plain' })
			.end('Not found');

		Promise.resolve( ).then(( ) => handler({
			request: req,
			logger: log,
		})).then(function handleResponse(response) {
			if (typeof response === 'string') return res
				.writeHead(200, { 'Content-Type': 'text/plain' })
				.end(response);

			const isExplicit = response != null
				&& response instanceof Response;
			if (isExplicit) return response.write(res);

			return res
				.writeHead(200, { 'Content-Type': 'application/json' })
				.end(JSON.stringify(response));
		}).catch(function handleError(err) {
			log.error(err);

			res.writeHead(500, { 'Content-Type': 'text/plain' });
			res.end('Internal server error');
		});
	});

	logger.debug('Initializing WebSocket server...');
	server.on('upgrade', function handleUpgrade(req, socket, head) {
		const log = getRequestLogger( );
		log(`UPGRADE ${req.url}`);

		const isPathAllowed = req.url === SOCKET_PATH;
		if (!isPathAllowed) {
			log.warn(`UPGRADE ${req.url} - Path rejected`);
			socket.destroy( );
		} else connect({
			request: req,
			socket: socket,
			head: head,
			logger: log,
		});
	});

	logger.debug(`Starting server at ${HOST}:${PORT}...`);
	server.listen(PORT, HOST, function onceListening( ) {
		// @ts-ignore - checking that the address is in the right format isn't worth the trouble
		const { address, port } = server.address( );
		logger(`Server started on ${address}:${port}`);
	});
})( );
