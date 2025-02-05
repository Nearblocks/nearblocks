import pg from 'pg';

import config from '#config';
import Sentry from '#libs/sentry';

const { Pool } = pg;

const db = new Pool({
  connectionString: config.dbUrl,
  max: 30,
});

db.on('error', (error) => Sentry.captureException(error));

export default db;
