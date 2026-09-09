import pgpromise from 'pg-promise';
import { ISSLConfig } from 'pg-promise/typescript/pg-subset.js';

import config from '#config';
import logger from '#libs/logger';
import { recordQuery } from '#libs/queryStats';

export const ssl: ISSLConfig = {
  rejectUnauthorized: true,
};

if (config.dbCa) {
  ssl.ca = Buffer.from(config.dbCa, 'base64').toString('utf-8');
  ssl.cert = Buffer.from(config.dbCert, 'base64').toString('utf-8');
  ssl.key = Buffer.from(config.dbKey, 'base64').toString('utf-8');
}

const queryStartedAt = new WeakMap<object, number>();

export const pgp = pgpromise({
  error: (_err, e) => {
    const startedAt = e.client ? queryStartedAt.get(e.client) : undefined;
    const ms = startedAt ? Date.now() - startedAt : 0;

    if (e.client) {
      queryStartedAt.delete(e.client);
    }

    recordQuery(e.queryFilePath, ms, true);

    if (e.cn) {
      logger.error(e.cn);
    }

    if (e.query) {
      logger.error(e.query);

      if (e.params) {
        logger.error(e.params);
      }
    }

    if (e.ctx) {
      logger.error(e.ctx);
    }
  },
  query: (e) => {
    if (e.client) {
      queryStartedAt.set(e.client, Date.now());
    }
  },
  receive: (e) => {
    if (e.ctx.client) {
      queryStartedAt.delete(e.ctx.client);
    }

    recordQuery(e.ctx.queryFilePath, e.result?.duration ?? 0, false);
  },
});

/**
 * Base database connection.
 */
export const dbBase = pgp({
  application_name: 'api-base',
  connectionString: config.dbUrlBase,
  max: 20,
  ssl: ssl?.ca ? ssl : false,
});

/**
 * Balance database connection.
 */
export const dbBalance = pgp({
  application_name: 'api-balance',
  connectionString: config.dbUrlBalance,
  max: 20,
  ssl: ssl?.ca ? ssl : false,
});

/**
 * Events database connection.
 */
export const dbEvents = pgp({
  application_name: 'api-events',
  connectionString: config.dbUrlEvents,
  max: 20,
  ssl: ssl?.ca ? ssl : false,
});

/**
 * Multichain database connection.
 */
export const dbMultichain = pgp({
  application_name: 'api-multichain',
  connectionString: config.dbUrlMultichain,
  max: 20,
  ssl: ssl?.ca ? ssl : false,
});

/**
 * Contract database connection.
 */
export const dbContract = pgp({
  application_name: 'api-contract',
  connectionString: config.dbUrlContract,
  max: 20,
  ssl: ssl?.ca ? ssl : false,
});

/**
 * Staking database connection.
 */
export const dbStaking = pgp({
  application_name: 'api-staking',
  connectionString: config.dbUrlStaking,
  max: 20,
  ssl: ssl?.ca ? ssl : false,
});
