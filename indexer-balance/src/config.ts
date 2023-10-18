import log from '#libs/log';
import { Config } from '#ts/types';
import { Network } from '#ts/enums';

const dbUrl = process.env.DATABASE_URL;
const redisUrl = process.env.REDIS_URL;
const rpcUrl = process.env.RPC_URL;

if (!dbUrl || !redisUrl || !rpcUrl) {
  log.error(
    {
      DATABASE_URL: dbUrl || null,
      REDIS_URL: redisUrl || null,
      RPC_URL: rpcUrl || null,
    },
    'missing config...',
  );
  process.exit();
}

const network: Network =
  process.env.NETWORK === Network.TESTNET ? Network.TESTNET : Network.MAINNET;
const genesisHeight = network === Network.MAINNET ? 9820210 : 42376888;
const s3BucketName =
  network === Network.MAINNET
    ? 'near-lake-data-mainnet'
    : 'near-lake-data-testnet';
const sentryDsn = process.env.SENTRY_DSN;

const config: Config = {
  dbUrl,
  redisUrl,
  rpcUrl,
  network: network,
  genesisHeight,
  cacheExpiry: 60 * 60 * 24, // cache expiry time in seconds (1 day)
  insertLimit: 1000, // records to insert into the db at a time
  delta: 100, // start from blocks earlier on sync interuption
  preloadSize: 100, // blocks to preload in nearlake
  s3BucketName,
  s3RegionName: 'eu-central-1',
  sentryDsn,
};

export default config;
