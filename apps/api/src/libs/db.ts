import { ConnectionOptions } from 'tls';

import pg from 'pg';

import config from '#config';

const { Pool } = pg;

export const ssl: ConnectionOptions = {
  rejectUnauthorized: true,
};

if (config.dbCa) {
  ssl.ca = Buffer.from(config.dbCa, 'base64').toString('utf-8');
  ssl.cert = Buffer.from(config.dbCert, 'base64').toString('utf-8');
  ssl.key = Buffer.from(config.dbKey, 'base64').toString('utf-8');
}

const db = new Pool({
  application_name: 'api',
  connectionString: config.dbUrl,
  max: 60,
  ssl: ssl?.ca ? ssl : false,
  statement_timeout: 60 * 1000, // 60s
});

export default db;
