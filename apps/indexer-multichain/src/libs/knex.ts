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

const dbConfig = {
  client: 'pg',
  connection: {
    application_name: 'indexer-multichain',
    connectionString: config.dbUrl,
    keepAlive: true,
    keepAliveInitialDelayMillis: 10_000,
    ssl: ssl?.ca ? ssl : false,
  },
  pool: {
    idleTimeoutMillis: 30_000,
    max: 10,
    min: 0,
    propagateCreateError: false,
  },
};

export const db: Knex = createKnex(dbConfig);
