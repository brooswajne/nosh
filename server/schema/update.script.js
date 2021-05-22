import {
	apply,
	getAllUpdates,
	queryCreateTable,
} from '../lib/schema.js';
import { query } from '../lib/database.js';

(async function run( ) {
	const start = Date.now( );

	console.log('Creating schema_updates table');
	const create = queryCreateTable( );
	await query(create);

	const updates = await getAllUpdates( );
	console.log(`${updates.length} schema updates found`);
	for (const update of updates) await apply(update);

	const duration = Date.now( ) - start;
	console.log(`Finished in ${duration}ms`);
})( ).then(( ) => process.exit(0), function onError(err) {
	console.error(err);
	process.exit(1);
});
