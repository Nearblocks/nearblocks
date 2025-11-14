import { ConnectionOptions } from 'tls';

import { createKnex } from 'nb-knex';

import config from '#config';

const ssl: ConnectionOptions = {
  rejectUnauthorized: true,
};

if (config.dbCa) {
  ssl.ca = Buffer.from(config.dbCa, 'base64').toString('utf-8');
  ssl.cert = Buffer.from(config.dbCert, 'base64').toString('utf-8');
  ssl.key = Buffer.from(config.dbKey, 'base64').toString('utf-8');
}

/**
 * Base database connection.
 */
export const dbBase = createKnex({
  client: 'pg',
  connection: {
    application_name: 'backend-base',
    connectionString: config.dbUrlBase,
    ssl: ssl?.ca ? ssl : false,
  },
  pool: { max: 1, min: 1 },
});

/**
 * Events database connection.
 */
export const dbEvents = createKnex({
  client: 'pg',
  connection: {
    application_name: 'backend-events',
    connectionString: config.dbUrlEvents,
    ssl: ssl?.ca ? ssl : false,
  },
  pool: { max: 1, min: 1 },
});

/**
 * Contracts database connection.
 */
export const dbContracts = createKnex({
  client: 'pg',
  connection: {
    application_name: 'backend-contracts',
    connectionString: config.dbUrlContracts,
    ssl: ssl?.ca ? ssl : false,
  },
  pool: { max: 1, min: 1 },
});

// dbBase.on('query', (query) => {
//   logger.warn({ bindings: query.bindings, sql: query.sql });
// });
// dbEvents.on('query', (query) => {
//   logger.warn({ bindings: query.bindings, sql: query.sql });
// });
// dbContracts.on('query', (query) => {
//   logger.warn({ bindings: query.bindings, sql: query.sql });
// });
