import { ConnectionOptions } from 'tls';

import pg from 'pg';

import config from '../config';
import logger from './logger';

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
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
  ssl: ssl?.ca ? ssl : false,
});

db.on('error', (err: Error) => logger.error(err));

export default db;
