import pg from 'pg';

import config from '#config';
import { errorHandler } from '#libs/utils';

const { Pool } = pg;

const db = new Pool({
  connectionString: config.dbUrl,
  max: 60,
});

export const mainnetDb = new Pool({
  connectionString: config.mainnetDbUrl,
  max: 60,
});

db.on('error', errorHandler);
mainnetDb.on('error', errorHandler);

export default db;
