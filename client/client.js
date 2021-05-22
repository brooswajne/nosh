// Public interface for consuming the client module

import {
	dirname,
	join,
} from 'path';

const DIR_HERE = dirname(import.meta.url.slice('file:'.length));
const DIR_TARGET = join(DIR_HERE, './dist');
const DIR_ASSETS = join(DIR_HERE, './assets');
const FILE_ENTRY = join(DIR_ASSETS, 'main.js');

/** Gets the path to the directory which the client files have been built to. */
export const getTargetDirectory = ( ) => DIR_TARGET;
/** Gets the path to the directory which contains the raw client assets. */
export const getAssetsDirectory = ( ) => DIR_ASSETS;
/** Gets the path to the entry javascript file. */
export const getAppEntryFile = ( ) => FILE_ENTRY;
