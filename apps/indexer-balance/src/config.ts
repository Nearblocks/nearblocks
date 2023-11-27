import { cleanEnv, str } from 'envalid';

import { Network } from 'nb-types';

import { Config } from '#types/types';

const env = cleanEnv(process.env, {
  DATABASE_CA: str({ default: '' }),
  DATABASE_CERT: str({ default: '' }),
  DATABASE_KEY: str({ default: '' }),
  DATABASE_URL: str(),
  NETWORK: str(),
  REDIS_URL: str(),
  RPC_URL: str(),
  SENTRY_DSN: str({ default: '' }),
});

const network: Network =
  env.NETWORK === Network.TESTNET ? Network.TESTNET : Network.MAINNET;
const s3BucketName =
  network === Network.MAINNET
    ? 'near-lake-data-mainnet'
    : 'near-lake-data-testnet';

const config: Config = {
  cacheExpiry: 60 * 60, // cache expiry time in seconds (1 hour)
  dbCa: env.DATABASE_CA,
  dbCert: env.DATABASE_CERT,
  dbKey: env.DATABASE_KEY,
  dbUrl: env.DATABASE_URL,
  delta: 100, // start from blocks earlier on sync interuption
  insertLimit: 1_000, // records to insert into the db at a time
  network: network,
  preloadSize: 100, // blocks to preload in nearlake
  redisUrl: env.REDIS_URL,
  rpcUrl: env.RPC_URL,
  s3BucketName,
  s3RegionName: 'eu-central-1',
  sentryDsn: env.SENTRY_DSN,
  startBlockHeight: 0,
};

export default config;
