import { types } from '@near-lake/framework';
import { bool, cleanEnv, num, str, url } from 'envalid';

import { Network } from 'nb-types';

import { DataSource } from '#types/enum';
import { Config } from '#types/types';

const env = cleanEnv(process.env, {
  BASE_DATA_SOURCE: str({
    choices: [DataSource.FAST_NEAR, DataSource.NEAR_LAKE],
    default: DataSource.NEAR_LAKE,
  }),
  BASE_START_BLOCK: num({ default: 0 }),
  DATABASE_CA: str({ default: '' }),
  DATABASE_CERT: str({ default: '' }),
  DATABASE_KEY: str({ default: '' }),
  DATABASE_URL: str(),
  DISABLE_S3_UPLOAD: bool({ default: false }),
  FASTNEAR_ENDPOINT: str({ default: undefined }),
  NEARLAKE_ACCESS_KEY: str(),
  NEARLAKE_ENDPOINT: url({ default: '' }),
  NEARLAKE_SECRET_KEY: str(),
  NETWORK: str({
    choices: [Network.MAINNET, Network.TESTNET],
  }),
  REDIS_PASSWORD: str({ default: '' }),
  REDIS_SENTINEL_NAME: str({ default: '' }),
  REDIS_SENTINEL_URLS: str({ default: '' }),
  REDIS_URL: url({ default: '' }),
  S3_ACCESS_KEY: str(),
  S3_BUCKET: str({ default: '' }),
  S3_ENDPOINT: url(),
  S3_REGION: str({ default: '' }),
  S3_SECRET_KEY: str(),
  SENTRY_DSN: str({ default: '' }),
});

const genesisHeight = env.NETWORK === Network.MAINNET ? 9_820_210 : 42_376_888;
const genesisTimestamp =
  env.NETWORK === Network.MAINNET
    ? '1595350551591948000'
    : '1596166782911378000';
const genesisFile = `https://s3-us-west-1.amazonaws.com/build.nearprotocol.com/nearcore-deploy/${env.NETWORK}/genesis.json`;
let nearlakeEndpoint: null | types.EndpointConfig = null;
const nearlakeBucketName =
  env.NETWORK === Network.MAINNET
    ? 'near-lake-data-mainnet'
    : 'near-lake-data-testnet';

if (env.NEARLAKE_ENDPOINT) {
  const endpoint = new URL(env.NEARLAKE_ENDPOINT);
  nearlakeEndpoint = {
    hostname: endpoint.hostname,
    path: endpoint.pathname,
    port: +endpoint.port || 80,
    protocol: endpoint.protocol,
  };
}

const config: Config = {
  cacheExpiry: 5 * 60, // cache expiry time in seconds (5 min)
  dataSource: env.BASE_DATA_SOURCE,
  dbCa: env.DATABASE_CA,
  dbCert: env.DATABASE_CERT,
  dbKey: env.DATABASE_KEY,
  dbUrl: env.DATABASE_URL,
  delta: 10, // start from blocks earlier on sync interuption
  disableS3Upload: env.DISABLE_S3_UPLOAD,
  fastnearEndpoint: env.FASTNEAR_ENDPOINT,
  genesisFile: genesisFile, // url to download genesis data
  genesisHeight,
  genesisTimestamp,
  insertLimit: 1_000, // records to insert into the db at a time
  nearlakeAccessKey: env.NEARLAKE_ACCESS_KEY,
  nearlakeBucketName,
  nearlakeEndpoint,
  nearlakeRegionName: 'eu-central-1',
  nearlakeSecretKey: env.NEARLAKE_SECRET_KEY,
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
  startBlockHeight: env.BASE_START_BLOCK,
};

export default config;
