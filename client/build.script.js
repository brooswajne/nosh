import {
	dirname,
	extname,
	join,
	relative,
} from 'path';
import { copyFile } from 'fs/promises';
import { watch } from 'fs';

import {
	ensureDir,
	traverse,
} from 'shared/dist/files.js';
import esbuild from 'esbuild';
import preprocess from 'svelte-preprocess';
import svelte from 'esbuild-svelte';

import {
	getAppEntryFile,
	getAssetsDirectory,
	getTargetDirectory,
} from './client.js';

const DIR_ROOT = dirname(import.meta.url.slice('file:'.length));
const DIR_TARGET = getTargetDirectory( );
const DIR_ASSETS = getAssetsDirectory( );
const FILE_ENTRY = getAppEntryFile( );

const shouldWatch = process.argv.includes('--watch')
	|| process.argv.includes('-w');
const shouldMap = process.argv.includes('--sourcemaps')
	|| process.argv.includes('-s');

const javascript = ( ) => esbuild.build({
	entryPoints: [ FILE_ENTRY ],
	outdir: DIR_TARGET,
	format: 'esm',
	bundle: true,
	sourcemap: shouldMap,
	watch: shouldWatch,
	plugins: [ svelte({
		preprocess: preprocess( ),
	}) ],
});
const assets = ( ) => traverse(DIR_ASSETS, async function copy(file) {
	const extension = extname(file);
	if (extension === '.js') return;

	const path = relative(DIR_ASSETS, file);
	const copy = join(DIR_TARGET, path);

	const directory = dirname(copy);
	const isKnown = knownDirs.has(directory);
	if (!isKnown) await ensureDir(directory);

	await copyFile(file, copy);
	console.log('Copied:', relative(DIR_ROOT, file), '->', relative(DIR_ROOT, copy));
});

const knownDirs = new Set( );
(async function build( ) {
	console.log('Building to:', DIR_TARGET);

	console.log('Bundling javascript...');
	await javascript( );

	console.log('Copying static assets...');
	await assets( );

	console.log('Watching static assets...');
	watch(DIR_ASSETS, { recursive: true }, function onChange( ) {
		console.log('Asset directory contents changed');
		assets( ).catch((err) => console.error('Error copying assets:', err));
	});
})( );
