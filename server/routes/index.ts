import type { ResponseWriter } from '@brooswajne/poodle';
import { text } from '@brooswajne/poodle';

export function GET( ): ResponseWriter {
	return text('Hello World');
}
