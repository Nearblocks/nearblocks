import { bool, cleanEnv, num, str } from 'envalid';

import { Network } from 'nb-types';

import { Config } from '#types/types';

const env = cleanEnv(process.env, {
  DATABASE_CA: str({ default: '' }),
  DATABASE_CERT: str({ default: '' }),
  DATABASE_KEY: str({ default: '' }),
  DATABASE_URL: str(),
  // Temp stream from s3
  DATABASE_URL_BASE: str(),
  DATABASE_URL_READ: str({ default: '' }),
  NETWORK: str({
    choices: [Network.MAINNET, Network.TESTNET],
  }),
  RECEIPTS_INDEXER_KEY: str(),
  RECEIPTS_START_BLOCK: num({ default: 0 }),
  S3_ACCESS_KEY: str(),
  S3_BUCKET: str({ default: '' }),
  S3_HOST: str(),
  S3_PORT: num({ default: 443 }),
  S3_SECRET_KEY: str(),
  S3_USE_SSL: bool({ default: true }),
  SENTRY_DSN: str({ default: '' }),
});

const config: Config = {
  cacheItems: 300_000,
  dbCa: env.DATABASE_CA,
  dbCert: env.DATABASE_CERT,
  dbKey: env.DATABASE_KEY,
  dbUrl: env.DATABASE_URL,
  // Temp stream from s3
  dbUrlBase: env.DATABASE_URL_BASE,
  dbUrlRead: env.DATABASE_URL_READ,
  delta: 10,
  indexerKey: env.RECEIPTS_INDEXER_KEY,
  insertLimit: 2500,
  network: env.NETWORK,
  s3AccessKey: env.S3_ACCESS_KEY,
  s3Bucket: env.S3_BUCKET,
  s3Host: env.S3_HOST,
  s3Port: env.S3_PORT,
  s3SecretKey: env.S3_SECRET_KEY,
  s3UseSsl: env.S3_USE_SSL,
  sentryDsn: env.SENTRY_DSN,
  startBlockHeight: env.RECEIPTS_START_BLOCK,
};

export default config;
