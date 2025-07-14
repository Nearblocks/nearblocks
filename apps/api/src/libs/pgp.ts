import pgpromise from 'pg-promise';
import { ISSLConfig } from 'pg-promise/typescript/pg-subset.js';

import config from '#config';
import logger from '#libs/logger';

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
  application_name: 'api-base',
  connectionString: config.dbUrlBase,
  max: 20,
  ssl: ssl?.ca ? ssl : false,
  // TODO: remove before merge
  statement_timeout: 10 * 60 * 100, // 10s
});

/**
 * Balance database connection.
 */
export const dbBalance = pgp({
  application_name: 'api-balance',
  connectionString: config.dbUrlBalance,
  max: 20,
  ssl: ssl?.ca ? ssl : false,
  // TODO: remove before merge
  statement_timeout: 10 * 60 * 100, // 10s
});
