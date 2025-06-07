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
    application_name: 'indexer-base',
    connectionString: config.dbUrl,
    ssl: ssl?.ca ? ssl : false,
  },
  pool: {
    acquireTimeoutMillis: 60000,
    createTimeoutMillis: 30000,
    idleTimeoutMillis: 30000,
    max: 20,
    min: 10,
    propagateCreateError: false,
  },
};

const migrationConfig = {
  ...writeConfig,
  connection: {
    ...writeConfig.connection,
    application_name: 'indexer-base-migration',
  },
  migrations: {
    directory: './apps/indexer-base/migrations',
    tableName: 'knex_migrations',
  },
  pool: { max: 1, min: 0 },
};

export const readConfig = {
  ...writeConfig,
  connection: {
    ...writeConfig.connection,
    application_name: 'indexer-base-read',
    connectionString: config.dbUrlRead || config.dbUrl,
  },
};

export const streamConfig = {
  ...readConfig,
  connection: {
    ...readConfig.connection,
    application_name: 'indexer-base-stream',
  },
};

export const dbWrite: Knex = createKnex(writeConfig);

export const dbRead: Knex = createKnex(readConfig);

export const dbMigration: Knex = createKnex(migrationConfig);
