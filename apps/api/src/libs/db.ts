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
  connectionString: config.dbUrl,
  max: 60,
  ssl: ssl?.ca ? ssl : false,
});

export const mainnetDb = new Pool({
  connectionString: config.mainnetDbUrl,
  max: 60,
  ssl: ssl?.ca ? ssl : false,
});

export default db;
