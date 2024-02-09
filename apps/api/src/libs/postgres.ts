import { ConnectionOptions } from 'tls';

import postgres from 'postgres';

import config from '#config';

const ssl: ConnectionOptions = {
  rejectUnauthorized: true,
};

if (config.dbCa) {
  ssl.ca = Buffer.from(config.dbCa, 'base64').toString('utf-8');
  ssl.cert = Buffer.from(config.dbCert, 'base64').toString('utf-8');
  ssl.key = Buffer.from(config.dbKey, 'base64').toString('utf-8');
}

const sql = postgres(config.dbUrl, {
  connection: {
    application_name: 'api',
    statement_timeout: 60 * 1000, // 60s
  },
  max: 60,
  ssl: ssl?.ca ? ssl : false,
});

export const userSql = postgres(config.userDbUrl, {
  connection: {
    application_name: 'user-api',
    statement_timeout: 60 * 1000, // 60s
  },
  max: 60,
  ssl: ssl?.ca ? ssl : false,
});

export default sql;
