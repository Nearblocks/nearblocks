import pgp from 'pg-promise';
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

const db = pgp({
  error: (_err, e) => {
    if (e.cn) {
      logger.error('Database connection error:', e.cn);
    }

    if (e.query) {
      logger.error('Query error:', e.query);

      if (e.params) {
        logger.error('Query parameters:', e.params);
      }
    }

    if (e.ctx) {
      logger.error('Context:', e.ctx);
    }
  },
});

export const dbBase = db({
  application_name: 'api',
  connectionString: config.dbUrl,
  max: 20,
  ssl: ssl?.ca ? ssl : false,
});
