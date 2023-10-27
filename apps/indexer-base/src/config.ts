import { cleanEnv, str } from 'envalid';

import { Network } from 'nb-types';

import { Config } from '#types/types';

const env = cleanEnv(process.env, {
  DATABASE_URL: str(),
  NETWORK: str(),
  REDIS_URL: str(),
  SENTRY_DSN: str({ default: '' }),
});

const network: Network =
  env.NETWORK === Network.TESTNET ? Network.TESTNET : Network.MAINNET;
const genesisHeight = network === Network.MAINNET ? 9820210 : 42376888;
const genesisTimestamp =
  network === Network.MAINNET ? '1595350551591948000' : '1596166782911378000';
const genesisFile = `https://s3-us-west-1.amazonaws.com/build.nearprotocol.com/nearcore-deploy/${network}/genesis.json`;
const s3BucketName =
  network === Network.MAINNET
    ? 'near-lake-data-mainnet'
    : 'near-lake-data-testnet';

const config: Config = {
  cacheExpiry: 5 * 60, // cache expiry time in seconds (5 min)
  dbUrl: env.DATABASE_URL,
  delta: 1000, // start from blocks earlier on sync interuption
  genesisFile: genesisFile, // url to download genesis data
  genesisHeight,
  genesisTimestamp,
  insertLimit: 1000, // records to insert into the db at a time
  network: network,
  preloadSize: 100, // blocks to preload in nearlake
  redisUrl: env.REDIS_URL,
  s3BucketName,
  s3RegionName: 'eu-central-1',
  sentryDsn: env.SENTRY_DSN,
};

export default config;
