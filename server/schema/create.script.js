import { create } from '../lib/schema.js';

const [ updateName ] = process.argv.slice(2);

create(updateName).catch(function handleError(err) {
	console.error(err);
	process.exit(1);
});
