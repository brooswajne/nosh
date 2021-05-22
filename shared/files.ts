import {
	dirname,
	isAbsolute,
	join,
} from 'path';
import {
	mkdir,
	readdir,
	stat,
} from 'fs/promises';

/**
 * Recursively traverses all files in the given directory, calling the provided `callback` for
 * each file. */
export async function traverse(
	directory: string, 
	visit: (path: string) => Promise<void>,
): Promise<void> {
	const entries = await readdir(directory, { withFileTypes: true });
	await Promise.all(entries.map(async function handleEntry(entry) {
		const file = entry.name;
		const path = join(directory, file);
		if (entry.isDirectory( )) await traverse(path, visit);
		else await visit(path);
	}));
}

/**
 * Recursively ensures that the file at the given path is a directory entry (along with all its 
 * parent paths).
 */
export async function ensureDir(path: string): Promise<void> {
	if (!isAbsolute(path)) throw new Error(`Path must be absolute: ${path}`);
	return stat(path).then(function ensureIsDirectory(stats) {
		if (!stats.isDirectory( )) throw new Error(`Not a directory: ${path}`);
	}, async function handleError(err) {
		if (err.code !== 'ENOENT') throw err;
		// file doesn't exist
		// ensure its parent is a directory
		const pathParent = dirname(path);
		await ensureDir(pathParent);
		// then create it
		await mkdir(path);
	});
}
