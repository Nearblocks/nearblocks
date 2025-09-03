import pgpromise from 'pg-promise';
import { ISSLConfig } from 'pg-promise/typescript/pg-subset.js';

import { logger } from 'nb-logger';

import config from '#config';

export const ssl: ISSLConfig = {
  rejectUnauthorized: true,
};

if (config.dbCa) {
  ssl.ca = Buffer.from(config.dbCa, 'base64').toString('utf-8');
  ssl.cert = Buffer.from(config.dbCert, 'base64').toString('utf-8');
  ssl.key = Buffer.from(config.dbKey, 'base64').toString('utf-8');
}

export const pgp = pgpromise({
  error: (_err, e) => {
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
  // TODO: remove before merge
  query(e) {
    logger.warn(e.query);
  },
});

/**
 * Base database connection.
 */
export const dbBase = pgp({
  application_name: 'backend-base',
  connectionString: config.dbUrlBase,
  max: 1,
  ssl: ssl?.ca ? ssl : false,
});

/**
 * Events database connection.
 */
export const dbEvents = pgp({
  application_name: 'backend-events',
  connectionString: config.dbUrlEvents,
  max: 1,
  ssl: ssl?.ca ? ssl : false,
});
