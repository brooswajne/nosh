import type { Logger } from '@brooswajne/terrier';
import type { ServerRequest } from '@brooswajne/poodle';

import { getChildFactory } from './logger.js';

export interface RequestContext {
	request: ServerRequest;
	logger: Logger;
	timestamp: number;
}

export const getRequestLogger = getChildFactory('request');
export function getRequestContext(request: ServerRequest): RequestContext {
	const logger = getRequestLogger( );
	const timestamp = Date.now( );
	logger.debug(`${request.method} ${request.url}`);
	return { request, logger, timestamp };
}
