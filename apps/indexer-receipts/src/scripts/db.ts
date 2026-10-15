import { ConnectionOptions } from 'tls';

import { createKnex, Knex } from 'nb-knex';

import config from '#config';
import { checkConcurrency } from '#scripts/range';

const ssl: ConnectionOptions = {
  rejectUnauthorized: true,
};

if (config.dbCa) {
  ssl.ca = Buffer.from(config.dbCa, 'base64').toString('utf-8');
  ssl.cert = Buffer.from(config.dbCert, 'base64').toString('utf-8');
  ssl.key = Buffer.from(config.dbKey, 'base64').toString('utf-8');
}

const connect = (applicationName: string, connectionString: string): Knex =>
  createKnex({
    client: 'pg',
    connection: {
      application_name: applicationName,
      connectionString,
      ssl: ssl?.ca ? ssl : false,
    },
    pool: { max: checkConcurrency + 2, min: 0 },
  });

export const db: Knex = connect('receipts-backfill', config.dbUrl);

export const dbRead: Knex = config.readDbUrl
  ? connect('receipts-check-read', config.readDbUrl)
  : db;
