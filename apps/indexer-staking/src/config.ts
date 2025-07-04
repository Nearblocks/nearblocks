import { bool, cleanEnv, num, str } from 'envalid';

import { Network } from 'nb-types';

import { Config } from '#types/types';

const env = cleanEnv(process.env, {
  DATABASE_CA: str({ default: '' }),
  DATABASE_CERT: str({ default: '' }),
  DATABASE_KEY: str({ default: '' }),
  DATABASE_URL: str(),
  DATABASE_URL_BASE: str({ default: '' }),
  NETWORK: str({
    choices: [Network.MAINNET, Network.TESTNET],
  }),
  S3_ACCESS_KEY: str(),
  S3_BUCKET: str({ default: '' }),
  S3_HOST: str(),
  S3_PORT: num({ default: 443 }),
  S3_SECRET_KEY: str(),
  S3_USE_SSL: bool({ default: true }),
  SENTRY_DSN: str({ default: '' }),
  STAKING_INDEXER_KEY: str(),
  STAKING_START_BLOCK: num({ default: 0 }),
});

const config: Config = {
  dbCa: env.DATABASE_CA,
  dbCert: env.DATABASE_CERT,
  dbKey: env.DATABASE_KEY,
  dbUrl: env.DATABASE_URL,
  dbUrlBase: env.DATABASE_URL_BASE,
  indexerKey: env.STAKING_INDEXER_KEY,
  network: env.NETWORK,
  s3AccessKey: env.S3_ACCESS_KEY,
  s3Bucket: env.S3_BUCKET,
  s3Host: env.S3_HOST,
  s3Port: env.S3_PORT,
  s3SecretKey: env.S3_SECRET_KEY,
  s3UseSsl: env.S3_USE_SSL,
  sentryDsn: env.SENTRY_DSN,
  startBlockHeight: env.STAKING_START_BLOCK,
};

export default config;
