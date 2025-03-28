import { ConnectionOptions } from 'tls';

import { createKnex, Knex } from 'nb-knex';

import config from '#config';

const ssl: ConnectionOptions = {
  rejectUnauthorized: true,
};

if (config.dbCa) {
  ssl.ca = Buffer.from(config.dbCa, 'base64').toString('utf-8');
  ssl.cert = Buffer.from(config.dbCert, 'base64').toString('utf-8');
  ssl.key = Buffer.from(config.dbKey, 'base64').toString('utf-8');
}

const writeConfig = {
  client: 'pg',
  connection: {
    application_name: 'indexer-receipts',
    connectionString: config.dbUrl,
    ssl: ssl?.ca ? ssl : false,
    statement_timeout: 60 * 1000,
  },
  pool: { max: 10, min: 1 },
};

export const readConfig = {
  ...writeConfig,
  connection: {
    ...writeConfig.connection,
    application_name: 'indexer-receipts-read',
    connectionString: config.dbUrlRead || config.dbUrl,
  },
};

export const streamConfig = {
  ...readConfig,
  connection: {
    ...readConfig.connection,
    application_name: 'indexer-receipts-stream',
  },
};

export const dbWrite: Knex = createKnex(writeConfig);

export const dbRead: Knex = createKnex(readConfig);
