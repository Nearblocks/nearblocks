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
    application_name: 'indexer-signature',
    connectionString: config.dbUrl,
    ssl: ssl?.ca ? ssl : false,
  },
  pool: { max: 10, min: 1 },
};

const migrationConfig = {
  ...dbConfig,
  connection: {
    ...dbConfig.connection,
    application_name: 'indexer-signature-migration',
  },
  migrations: {
    directory: './apps/indexer-signature/migrations',
    tableName: 'knex_migrations',
  },
  pool: { max: 1, min: 0 },
};

const baseConfig = {
  ...dbConfig,
  connection: {
    ...dbConfig.connection,
    application_name: 'indexer-signature-base',
    connectionString: config.dbUrlBase,
  },
};

export const streamConfig = {
  ...baseConfig,
  connection: {
    ...baseConfig.connection,
    application_name: 'indexer-signature-stream',
  },
};

export const db: Knex = createKnex(dbConfig);

export const dbBase: Knex = createKnex(baseConfig);

export const dbMigration: Knex = createKnex(migrationConfig);
