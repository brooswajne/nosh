import { join } from 'path';

import { DIR_SRC } from '../../util/files.js';
import { file } from '../../lib/responses.js';

const FILE_INDEX = join(DIR_SRC, './index.html');
export function GET( ) {
	return file(FILE_INDEX);
}
