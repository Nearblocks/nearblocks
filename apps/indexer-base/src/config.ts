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
  BASE_INDEXER_KEY: str(),
  BASE_START_BLOCK: num({ default: 0 }),
  DATABASE_CA: str({ default: '' }),
  DATABASE_CERT: str({ default: '' }),
  DATABASE_KEY: str({ default: '' }),
  DATABASE_URL: str(),
  // Temp stream from s3
  DATABASE_URL_BASE: str(),
  DATABASE_URL_READ: str({ default: '' }),
  DISABLE_AUTO_SWITCH: bool({ default: false }),
  DISABLE_S3_UPLOAD: bool({ default: false }),
  FASTNEAR_ENDPOINT: str({ default: undefined }),
  NEARLAKE_ACCESS_KEY: str(),
  NEARLAKE_ENDPOINT: url({ default: '' }),
  NEARLAKE_SECRET_KEY: str(),
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
});

const genesisHeight = env.NETWORK === Network.MAINNET ? 9_820_210 : 42_376_888;
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
  dataSource: env.BASE_DATA_SOURCE,
  dbCa: env.DATABASE_CA,
  dbCert: env.DATABASE_CERT,
  dbKey: env.DATABASE_KEY,
  dbUrl: env.DATABASE_URL,
  // Temp stream from s3
  dbUrlBase: env.DATABASE_URL_BASE,
  dbUrlRead: env.DATABASE_URL_READ,
  delta: 10, // start from blocks earlier on sync interuption
  disableAutoSwitch: env.DISABLE_AUTO_SWITCH,
  disableS3Upload: env.DISABLE_S3_UPLOAD,
  fastnearEndpoint: env.FASTNEAR_ENDPOINT,
  genesisHeight,
  indexerKey: env.BASE_INDEXER_KEY,
  insertLimit: 2_500, // records to insert into the db at a time
  nearlakeAccessKey: env.NEARLAKE_ACCESS_KEY,
  nearlakeBucketName,
  nearlakeEndpoint,
  nearlakeRegionName: 'eu-central-1',
  nearlakeSecretKey: env.NEARLAKE_SECRET_KEY,
  network: env.NETWORK,
  preloadSize: 1000, // blocks to preload in nearlake
  s3AccessKey: env.S3_ACCESS_KEY,
  s3Bucket: env.S3_BUCKET,
  s3Host: env.S3_HOST,
  s3Port: env.S3_PORT,
  s3SecretKey: env.S3_SECRET_KEY,
  s3UseSsl: env.S3_USE_SSL,
  sentryDsn: env.SENTRY_DSN,
  startBlockHeight: env.BASE_START_BLOCK,
};

export default config;
