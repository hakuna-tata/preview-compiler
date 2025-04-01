import { getSchema } from './data';
import { generate } from './generate';

getSchema().then(res => generate(res));