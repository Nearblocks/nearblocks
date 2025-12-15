import { cleanEnv, num, str, url } from 'envalid';

import { Network } from 'nb-types';

import { Config } from '#types/types';

const env = cleanEnv(process.env, {
  BALANCE_START_BLOCK: num({ default: 0 }),
  DATABASE_CA: str({ default: '' }),
  DATABASE_CERT: str({ default: '' }),
  DATABASE_KEY: str({ default: '' }),
  DATABASE_URL: str(),
  DATABASE_URL_READ: str({ default: '' }),
  NETWORK: str({
    choices: [Network.MAINNET, Network.TESTNET],
  }),
  PROXY_URL: url({ default: '' }),
  S3_ACCESS_KEY: str({ default: '' }),
  S3_BUCKET: str({ default: 'nearblocks' }),
  S3_ENDPOINT: url({ default: '' }),
  S3_REGION: str({ default: '' }),
  S3_SECRET_KEY: str({ default: '' }),
  SENTRY_DSN: str({ default: '' }),
});

const config: Config = {
  dbCa: env.DATABASE_CA,
  dbCert: env.DATABASE_CERT,
  dbKey: env.DATABASE_KEY,
  dbUrl: env.DATABASE_URL,
  dbUrlRead: env.DATABASE_URL_READ,
  indexerKey: 'balance',
  network: env.NETWORK,
  proxyUrl: env.PROXY_URL,
  s3AccessKey: env.S3_ACCESS_KEY,
  s3Bucket: env.S3_BUCKET,
  s3Endpoint: env.S3_ENDPOINT,
  s3Region: env.S3_REGION,
  s3SecretKey: env.S3_SECRET_KEY,
  sentryDsn: env.SENTRY_DSN,
  startBlockHeight: env.BALANCE_START_BLOCK,
};

export default config;
