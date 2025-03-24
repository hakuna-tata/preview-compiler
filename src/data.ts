import * as fs from 'fs/promises';
import * as path from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

export const getSchema = async () => {
  const argv: Record<string, any> = yargs(hideBin(process.argv))
    .option('schema', {
      describe: '指定 schema.json 文件的路径',
      type: 'string',
      demandOption: true,
    })
    .help()
    .argv;

  const schemaFilePath: string = argv.schema;
  const fullPath = path.resolve(schemaFilePath);

  try {
    const data = await fs.readFile(fullPath, 'utf8');
    const schemaData = JSON.parse(data);

    return schemaData;
  } catch (err) {
    console.error(`读取或解析 schema.json 文件时出错: ${(err as Error).message}`);
  }
}

