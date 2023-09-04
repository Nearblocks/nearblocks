import log from '#libs/log';
import { Config } from '#ts/types';
import { Network } from '#ts/enums';

const dbUrl = process.env.DATABASE_URL;
const redisUrl = process.env.REDIS_URL;

if (!dbUrl || !redisUrl) {
  log.error({ dbUrl, redisUrl }, 'missing config...');
  log.error(
    { DATABASE_URL: dbUrl || null, REDIS_URL: redisUrl || null },
    'missing config...',
  );
  process.exit();
}

const network: Network =
  process.env.NETWORK === Network.TESTNET ? Network.TESTNET : Network.MAINNET;
const genesisHeight = network === Network.MAINNET ? 9820210 : 42376888;
const genesisFile = `https://s3-us-west-1.amazonaws.com/build.nearprotocol.com/nearcore-deploy/${network}/genesis.json`;
const s3BucketName =
  network === Network.MAINNET
    ? 'near-lake-data-mainnet'
    : 'near-lake-data-testnet';
const sentryDsn = process.env.SENTRY_DSN;

const config: Config = {
  dbUrl: dbUrl,
  redisUrl: redisUrl,
  network: network,
  genesisFile: genesisFile, // url to download genesis data
  genesisHeight,
  cacheExpiry: 5 * 60, // cache expiry time in seconds (5 min)
  insertLimit: 1000, // records to insert into the db at a time
  delta: 1000, // start from blocks earlier on sync interuption
  preloadSize: 100, // blocks to preload in nearlake
  s3BucketName,
  s3RegionName: 'eu-central-1',
  sentryDsn,
};

export default config;
