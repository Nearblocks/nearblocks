import pg from 'pg';

import config from '#config';

const { Pool } = pg;

const db = new Pool({
  connectionString: config.dbUrl,
  max: 60,
});

export const mainnetDb = new Pool({
  connectionString: config.mainnetDbUrl,
  max: 60,
});

export default db;
