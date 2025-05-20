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
    application_name: 'indexer-balance',
    connectionString: config.dbUrl,
    ssl: ssl?.ca ? ssl : false,
    statement_timeout: 60 * 1000,
  },
  pool: { max: 10, min: 1 },
};

const migrationConfig = {
  ...dbConfig,
  connection: {
    ...dbConfig.connection,
    application_name: 'indexer-balance-migration',
  },
  migrations: {
    directory: './apps/indexer-balance/migrations',
    tableName: 'knex_migrations',
  },
  pool: { max: 1, min: 0 },
};

export const streamConfig = {
  ...dbConfig,
  connection: {
    ...dbConfig.connection,
    application_name: 'indexer-balance-stream',
    connectionString: config.dbUrlBase,
  },
};

export const db: Knex = createKnex(dbConfig);

export const dbMigration: Knex = createKnex(migrationConfig);
