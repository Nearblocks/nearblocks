import { cleanEnv, num, str, url } from 'envalid';

import { types } from 'nb-lake';
import { Network } from 'nb-types';

import { DataSource } from '#types/enum';
import { Config } from '#types/types';

const env = cleanEnv(process.env, {
  DATABASE_CA: str({ default: '' }),
  DATABASE_CERT: str({ default: '' }),
  DATABASE_KEY: str({ default: '' }),
  DATABASE_URL: str(),
  NETWORK: str({
    choices: [Network.MAINNET, Network.TESTNET],
  }),
  S3_ENDPOINT: url({ default: '' }),
  SENTRY_DSN: str({ default: '' }),
  STAKING_DATA_SOURCE: str({
    choices: [DataSource.FAST_NEAR, DataSource.NEAR_LAKE],
    default: DataSource.NEAR_LAKE,
  }),
  STAKING_START_BLOCK: num({ default: 0 }),
});

const genesisHeight = env.NETWORK === Network.MAINNET ? 9_820_210 : 42_376_888;
let s3Endpoint: null | types.EndpointConfig = null;
const s3BucketName =
  env.NETWORK === Network.MAINNET
    ? 'near-lake-data-mainnet'
    : 'near-lake-data-testnet';

if (env.S3_ENDPOINT) {
  const endpoint = new URL(env.S3_ENDPOINT);
  s3Endpoint = {
    hostname: endpoint.hostname,
    path: endpoint.pathname,
    port: +endpoint.port || 80,
    protocol: endpoint.protocol,
  };
}

const config: Config = {
  cacheExpiry: 60 * 60,
  dataSource: env.STAKING_DATA_SOURCE,
  dbCa: env.DATABASE_CA,
  dbCert: env.DATABASE_CERT,
  dbKey: env.DATABASE_KEY,
  dbUrl: env.DATABASE_URL,
  delta: 1_000,
  genesisHeight,
  insertLimit: 1_000,
  network: env.NETWORK,
  preloadSize: 100,
  s3BucketName,
  s3Endpoint,
  s3RegionName: 'eu-central-1',
  sentryDsn: env.SENTRY_DSN,
  startBlockHeight: env.STAKING_START_BLOCK,
};

export default config;
