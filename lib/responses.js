// TODO: break out into individual files

import { createReadStream } from 'fs';
import { stat } from 'fs/promises';

import { getContentType } from '../util/content-types.js';

import { STATUS_MESSAGES } from './responses/status-codes.js';

const DEFAULT_ERROR_CODE = 500;

/** @typedef {import('http').ServerResponse} ServerResponse */

export class Response {
	constructor( ) {
		this.code = 200;
	}

	/**
	 * Writes this response to the associated `ServerResponse` object.
	 * @param {ServerResponse} res
	 */
	async write(res) {
		throw new Error(`${this.constructor.name}#write() not implemented`);
	}
}

export class JSONResponse extends Response {
	/** @param {object} body */
	constructor(body) {
		super( );
		this.body = body;
	}

	async write(/** @type {ServerResponse} */ res) {
		const json = JSON.stringify(this.body);
		const size = Buffer.byteLength(json);
		res.statusCode = this.code;
		res.setHeader('Content-Type', 'application/json');
		res.setHeader('Content-Length', size);
		res.end(json);
	}
}
/** @param {object} body */
export const json = (body) => new JSONResponse(body);

export class HTMLResponse extends Response {
	/** @param {string} html */
	constructor(html) {
		super( );
		this.html = html;
	}

	async write(/** @type {ServerResponse} */ res) {
		const size = Buffer.byteLength(this.html);
		res.statusCode = this.code;
		res.setHeader('Content-Type', 'text/html');
		res.setHeader('Content-Length', size);
		res.end(this.html);
	}
}
/** @param {string} html */
export const html = (html) => new HTMLResponse(html);

export class FileResponse extends Response {
	/** @param {string} file */
	constructor(file) {
		super( );
		this.file = file;
	}

	async write(/** @type {ServerResponse} */ res) {
		const { size } = await stat(this.file);
		res.statusCode = this.code;
		res.setHeader('Content-Type', getContentType(this.file));
		res.setHeader('Content-Length', size);
		createReadStream(this.file).pipe(res);
	}
}
/** @param {string} file */
export const file = (file) => new FileResponse(file);

export class HTTPError extends Response {
	constructor(code = DEFAULT_ERROR_CODE) {
		super( );
		this.code = code;
	}

	async write(/** @type {ServerResponse} */ res) {
		const message = STATUS_MESSAGES[ this.code ] || 'Unknown Error';
		const size = Buffer.byteLength(message);
		res.statusCode = this.code;
		res.setHeader('Content-Type', 'text/html');
		res.setHeader('Content-Length', size);
		res.end(message);
	}
}

