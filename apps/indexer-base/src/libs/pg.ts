import { ConnectionOptions } from 'tls';

import pg from 'pg';
const { Pool } = pg;

import config from '#config';

const ssl: ConnectionOptions = {
  rejectUnauthorized: true,
};

if (config.dbCa) {
  ssl.ca = Buffer.from(config.dbCa, 'base64').toString('utf-8');
  ssl.cert = Buffer.from(config.dbCert, 'base64').toString('utf-8');
  ssl.key = Buffer.from(config.dbKey, 'base64').toString('utf-8');
}

export const pool = new Pool({
  application_name: 'indexer-base',
  connectionString: config.dbUrl,
  connectionTimeoutMillis: 60000,
  idleTimeoutMillis: 30000,
  max: 20,
  min: 10,
  ssl: ssl?.ca ? ssl : false,
});
