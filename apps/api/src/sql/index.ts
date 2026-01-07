import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import pgp, { IQueryFileOptions } from 'pg-promise';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const sql = (file: string): pgp.QueryFile => {
  const fullPath: string = join(__dirname, file);

  const options: IQueryFileOptions = {
    compress: true,
    minify: true,
  };

  const qf: pgp.QueryFile = new pgp.QueryFile(fullPath, options);

  if (qf.error) {
    console.error(qf.error);
  }

  return qf;
};
