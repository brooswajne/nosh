import Postgres from 'pg';

import { generateLoggingID } from '../util/random.js';

import {
	IS_COLOUR_SUPPORTED,
	getComponentColour,
	logger,
} from './logger.js';

const COLOUR_QUERY = getComponentColour( );

const pool = new Postgres.Pool( );

/** @typedef {Postgres.QueryConfig<any> | string} QueryDefinition */
/** @typedef {(query: QueryDefinition) => Promise<Postgres.QueryResult>} QueryRunner */
/** @typedef {import('./logger').Logger} Logger */

/**
 * A template string function which creates a parametrised SQL
 * query for associated string.
 * @template {any[]} TParams
 * @param {TemplateStringsArray} strings
 * @param {TParams} values
 * @returns {Postgres.QueryConfig<TParams>}
 */
export function sql(strings, ...values) {
	let text = '';
	for (const idx of strings.keys( )) {
		const string = strings[ idx ];
		if (idx === 0) text += string;
		else text += `$${idx}${string}`;
	}
	return { text, values };
}

/**
 * @param {Postgres.Pool|Postgres.PoolClient} client
 * @param {object} [options]
 * @param {Logger} [options.logger]
 * @returns {QueryRunner}
 */
export function getQueryRunner(client, {
	logger: parentLogger = logger,
} = { }) {
	return function run(query) {
		const id = generateLoggingID( );
		const log = IS_COLOUR_SUPPORTED
			? logger.child(`${COLOUR_QUERY}query:${id}\x1b[0m`)
			: logger.child(`query:${id}`);

		if (typeof query === 'string') log.debug('Running query:', query);
		else log.debug('Running query:', query.text, query.values);

		const start = Date.now( );
		return client.query(query).then(function onSuccess(res) {
			const time = Date.now( ) - start;
			log.debug(`Got ${res.rowCount} row(s) in ${time}ms`);
			return res;
		}, function handleError(err) {
			const time = Date.now( ) - start;
			log.debug(`Failed after ${time}ms:`, err);
			throw err;
		});
	};
}

/** The default query runner */
export const query = getQueryRunner(pool);

/**
 * Runs a callback function inside a transaction.
 * @param {(context: { query: QueryRunner }) => Promise<void>} callback
 */
export async function transaction(callback) {
	const client = await pool.connect( );
	const query = getQueryRunner(client);
	try {
		return callback({ query });
	} catch (err) {
		await client.query('ROLLBACK');
		throw err;
	} finally {
		client.release( );
	}
}
