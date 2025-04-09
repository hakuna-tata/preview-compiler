import fs from 'fs';
import path from 'path';
import { getSchema } from './data';
import { generate } from './generate';

getSchema().then(async (schema) => {
  const umdCode = await generate(schema);

  const outputFile = path.join(__dirname, 'output.js');
  if (umdCode) {
    fs.writeFileSync(outputFile, umdCode, 'utf-8')
  } else {
    console.log('umdCode 为空')
  }
});