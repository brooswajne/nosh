import { extname } from 'path';

/** @type {Record<string, string> */
export const CONTENT_TYPES = Object.freeze({
	'.css': 'text/css',
	'.html': 'text/html',
	'.js': 'application/javascript',
	'.map': 'application/octet-stream',
});

/**
 * Given a filename/path, returns its associated content type.
 * @param {string} file
 */
export const getContentType = (file) => CONTENT_TYPES[ extname(file) ];

/**
 * Given a content type, returns its associated filetype extension.
 * @param {string} contentType
 */
export const getExtension = (contentType) => Object.keys(CONTENT_TYPES)
	.find((extension) => CONTENT_TYPES[ extension ] === contentType);
