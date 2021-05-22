import Postgres from 'pg';

import { getChildFactory } from './logger.js';

const pool = new Postgres.Pool( );

const getQueryLogger = getChildFactory('query');

/** @typedef {Postgres.QueryConfig<any> | string} QueryDefinition */
/** @typedef {(query: QueryDefinition) => Promise<Postgres.QueryResult>} QueryRunner */

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
 * @returns {QueryRunner}
 */
export function getQueryRunner(client) {
	return function run(query) {
		const logger = getQueryLogger( );

		if (typeof query === 'string') logger.debug('Running query:', query);
		else logger.debug('Running query:', query.text, query.values);

		const start = Date.now( );
		return client.query(query).then(function onSuccess(res) {
			const time = Date.now( ) - start;
			logger.debug(`Got ${res.rowCount} row(s) in ${time}ms`);
			return res;
		}, function handleError(err) {
			const time = Date.now( ) - start;
			logger.debug(`Failed after ${time}ms:`, err);
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
