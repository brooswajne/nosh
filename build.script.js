import {
	dirname,
	extname,
	join,
	relative,
} from 'path';
import { copyFile } from 'fs/promises';
import { watch } from 'fs';

import esbuild from 'esbuild';
import svelte from 'esbuild-svelte';

import {
	DIR_DIST,
	DIR_SRC,
	ensureDir,
	traverse,
} from './util/files.js';

const shouldWatch = process.argv.includes('--watch')
	|| process.argv.includes('-w');
const shouldMap = process.argv.includes('--sourcemaps')
	|| process.argv.includes('-s');

const javascript = ( ) => esbuild.build({
	entryPoints: [ './src/main.js' ],
	outdir: DIR_DIST,
	format: 'esm',
	bundle: true,
	sourcemap: shouldMap,
	watch: shouldWatch,
	plugins: [ svelte( ) ],
});
const assets = ( ) => traverse(DIR_SRC, async function copy(file) {
	const extension = extname(file);
	if (extension === '.js') return;

	const path = relative(DIR_SRC, file);
	const copy = join(DIR_DIST, path);

	const directory = dirname(copy);
	const isKnown = knownDirs.has(directory);
	if (!isKnown) await ensureDir(directory);

	await copyFile(file, copy);
	console.log('- Copied:', copy);
});

const knownDirs = new Set( );
(async function build( ) {
	console.log('Building to:', DIR_DIST);

	console.log('Bundling javascript...');
	await javascript( );

	console.log('Copying static assets...');
	await assets( );

	console.log('Watching static assets...');
	watch(DIR_SRC, { recursive: true }, function onChange( ) {
		console.log('Asset directory contents changed');
		assets( ).catch((err) => console.error('Error copying assets:', err));
	});
})( );
