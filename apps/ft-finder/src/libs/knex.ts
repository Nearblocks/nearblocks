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

const client = (name: string, connectionString: string): Knex =>
  createKnex({
    client: 'pg',
    connection: {
      application_name: `ft-finder-${name}`,
      connectionString,
      ssl: ssl?.ca ? ssl : false,
      statement_timeout: 5 * 60 * 1000,
    },
    pool: { max: 5, min: 0 },
  });

export const dbBase: Knex = client('base', config.dbUrlBase);

export const dbContract: Knex = client('contract', config.dbUrlContract);

export const dbEvents: Knex = client('events', config.dbUrlEvents);

export const destroyAll = async (): Promise<void> => {
  await Promise.all([
    dbBase.destroy(),
    dbContract.destroy(),
    dbEvents.destroy(),
  ]);
};
