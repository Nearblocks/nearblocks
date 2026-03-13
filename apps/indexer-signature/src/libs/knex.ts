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
    keepAlive: true,
    keepAliveInitialDelayMillis: 10_000,
    ssl: ssl?.ca ? ssl : false,
  },
  pool: {
    max: 5,
    min: 0,
    idleTimeoutMillis: 30_000,
    propagateCreateError: false,
  },
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

export const db: Knex = createKnex(dbConfig);

export const dbMigration: Knex = createKnex(migrationConfig);
