import { cleanEnv, num, str, url } from 'envalid';

import { Network } from 'nb-types';

import { Config } from '#types/types';

const env = cleanEnv(process.env, {
  DATABASE_CA: str({ default: '' }),
  DATABASE_CERT: str({ default: '' }),
  DATABASE_KEY: str({ default: '' }),
  DATABASE_URL: str(),
  DATABASE_URL_READ: str({ default: '' }),
  MULTICHAIN_START_BLOCK: num({ default: 0 }),
  NETWORK: str({
    choices: [Network.MAINNET, Network.TESTNET],
  }),
  REDIS_PASSWORD: str({ default: '' }),
  REDIS_SENTINEL_NAME: str({ default: '' }),
  REDIS_SENTINEL_URLS: str({ default: '' }),
  REDIS_URL: url({ default: '' }),
  S3_ACCESS_KEY: str(),
  S3_BUCKET: str({ default: 'nearblocks' }),
  S3_ENDPOINT: url(),
  S3_REGION: str({ default: '' }),
  S3_SECRET_KEY: str(),
  SENTRY_DSN: str({ default: '' }),
});

const config: Config = {
  cacheExpiry: 5 * 60, // cache expiry time in seconds (5 min)
  dbCa: env.DATABASE_CA,
  dbCert: env.DATABASE_CERT,
  dbKey: env.DATABASE_KEY,
  dbUrl: env.DATABASE_URL,
  dbUrlRead: env.DATABASE_URL_READ,
  delta: 1_000, // start from blocks earlier on sync interuption
  insertLimit: 1_000, // records to insert into the db at a time
  network: env.NETWORK,
  preloadSize: 100, // blocks to preload in nearlake
  redisPassword: env.REDIS_PASSWORD,
  redisSentinelName: env.REDIS_SENTINEL_NAME,
  redisSentinelUrls: env.REDIS_SENTINEL_URLS,
  redisUrl: env.REDIS_URL,
  s3AccessKey: env.S3_ACCESS_KEY,
  s3Bucket: env.S3_BUCKET,
  s3Endpoint: env.S3_ENDPOINT,
  s3Region: env.S3_REGION,
  s3SecretKey: env.S3_SECRET_KEY,
  sentryDsn: env.SENTRY_DSN,
  startBlockHeight: env.MULTICHAIN_START_BLOCK,
};

export default config;
