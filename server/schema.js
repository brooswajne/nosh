import {
	dirname,
	join,
} from 'path';
import {
	mkdir,
	readFile,
	readdir,
	writeFile,
} from 'fs/promises';

import {
	sql,
	transaction,
} from './database.js';

const DIR_HERE = dirname(import.meta.url.slice('file:'.length));
const DIR_ROOT = join(DIR_HERE, '../');

export const DIR_SCHEMA = join(DIR_ROOT, 'schema');
export const FILE_APPLY = 'apply.sql';
export const FILE_REVERT = 'revert.sql';
/** Required format for the name of a schema update */
export const FORMAT_NAME = /^[a-z-]{3,}$/;
/** Required format for the directory of a schema update */
export const FORMAT_DIR = /^\d{17}-[a-z-]{3,}$/;

export class SchemaUpdateNameInvalidError extends Error {
	/** @param {string} name */
	constructor(name) {
		const message = `Invalid schema update name "${name}" - must match ${FORMAT_NAME}`;
		super(message);
		this.name = 'SchemaUpdateNameInvalidError';
	}
}
export class SchemaUpdateNameConflictError extends Error {
	/**
	 * @param {string} name
	 * @param {string} existing
	 * The existing schema update's full name (including timestamp).
	 */
	constructor(name, existing) {
		const message = `Schema update "${name}" already exists as "${existing}"`;
		super(message);
		this.name = 'SchemaUpdateNameConflictError';
	}
}

// Queries

/** Creates the `schema_update` table if it doesn't already exist */
export const queryCreateTable = ( ) => sql`
CREATE TABLE IF NOT EXISTS schema_updates(
	update     VARCHAR(50) PRIMARY KEY NOT NULL,
	applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
)`;
/**
 * Gets the installation date for a specified schema update.
 * @param {string} update
 */
export const queryAppliedAt = (update) => sql`
SELECT applied_at FROM schema_updates WHERE update=${update}`;
/**
 * Saves the fact that the specified schema update has been applied.
 * @param {string} update
 */
export const querySaveUpdate = (update) => sql`
INSERT INTO schema_updates (update) VALUES (${update})`;
/**
 * Removes a schema update from the `schema_update` table.
 * @param {string} update
 */
export const queryDeleteUpdate = (update) => sql`
DELETE FROM schema_updates WHERE update=${update}`;

// Schema Utilities

/**
 * Gets the path to the specified schema update.
 * @param {string} update
 */
export function getPath(update) {
	return join(DIR_SCHEMA, update);
}

/** Gets a list of all known schema updates */
export async function getAllUpdates( ) {
	const contents = await readdir(DIR_SCHEMA, { withFileTypes: true });
	return contents.filter(function isSchemaUpdate(file) {
		if (!file.isDirectory( )) return false;
		return FORMAT_DIR.test(file.name);
	}).map((folder) => folder.name).sort( );
}

/**
 * Applies the specified schema update.
 * Ignored if the update is already applied.
 * @param {string} update
 */
export const apply = (update) => transaction(async function apply({ query }) {
	console.log('Applying schema update:', update);
	const upgradeRoot = getPath(update);
	const upgradePath = join(upgradeRoot, FILE_APPLY);

	const applied = queryAppliedAt(update);
	const { rows } = await query(applied);
	if (rows.length > 0) return void console.log(`Already applied on ${rows[ 0 ][ 'applied_at' ]}`);

	console.log('Applying:', upgradePath);
	const upgrade = await readFile(upgradePath, { encoding: 'utf-8' });
	await query(upgrade);
	const save = querySaveUpdate(update);
	await query(save);
	console.log('Successful');
});

/**
 * Reverts the specified schema update.
 * Ignored if the update is not already applied.
 * @param {string} update
 */
export const revert = (update) => transaction(async function revert({ query }) {
	console.log('Reverting schema update:', update);
	const revertRoot = getPath(update);
	const revertPath = join(revertRoot, FILE_REVERT);

	const applied = queryAppliedAt(update);
	const { rows } = await query(applied);
	if (rows.length === 0) return void console.log('Not applied');

	console.log('Reverting:', revertPath);
	const revert = await readFile(revertPath, { encoding: 'utf-8' });
	await query(revert);
	const save = queryDeleteUpdate(update);
	await query(save);
	console.log('Successful');
});

/**
 * Creates the files for a new schema update with the given name.
 * @param {string} name
 */
export async function create(name) {
	const isValid = FORMAT_NAME.test(name);
	if (!isValid) throw new SchemaUpdateNameInvalidError(name);

	const existingUpdates = await getAllUpdates( );
	const existing = existingUpdates.find(function hasSameName(existingUpdate) {
		const indexOfName = existingUpdate.indexOf('-') + 1;
		const updateName = existingUpdate.slice(indexOfName);
		return updateName === name;
	});
	if (existing != null) throw new SchemaUpdateNameConflictError(name, existing);

	const date = new Date( )
		.toISOString( )
		.replace(/[^\d-]+/g, '');
	const path = join(`${date}-${name}`);
	await mkdir(path);

	const pathApply = join(path, FILE_APPLY);
	const pathRevert = join(path, FILE_REVERT);
	await Promise.all([
		writeFile(pathApply, ''),
		writeFile(pathRevert, ''),
	]);
}
