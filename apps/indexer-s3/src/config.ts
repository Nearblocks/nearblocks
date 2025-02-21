import { cleanEnv, num, str, url } from 'envalid';
import { types } from 'near-lake-framework';

import { Network } from 'nb-types';

import { DataSource } from '#types/enum';
import { Config } from '#types/types';

const env = cleanEnv(process.env, {
  FASTNEAR_RAW_ENDPOINT: str({ default: undefined }),
  NEARLAKE_ACCESS_KEY: str(),
  NEARLAKE_ENDPOINT: url({ default: '' }),
  NEARLAKE_SECRET_KEY: str(),
  NETWORK: str({
    choices: [Network.MAINNET, Network.TESTNET],
  }),
  S3_ACCESS_KEY: str(),
  S3_BUCKET: str(),
  S3_DATA_SOURCE: str({
    choices: [DataSource.FAST_NEAR_RAW, DataSource.NEAR_LAKE],
    default: DataSource.NEAR_LAKE,
  }),
  S3_END_BLOCK: num(),
  S3_ENDPOINT: url(),
  S3_REGION: str(),
  S3_SECRET_KEY: str(),
  S3_START_BLOCK: num({ default: 0 }),
});

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
  dataSource: env.S3_DATA_SOURCE,
  endBlockHeight: env.S3_END_BLOCK,
  fastnearEndpoint: env.FASTNEAR_RAW_ENDPOINT,
  nearlakeAccessKey: env.NEARLAKE_ACCESS_KEY,
  nearlakeBucketName,
  nearlakeEndpoint,
  nearlakeRegionName: 'eu-central-1',
  nearlakeSecretKey: env.NEARLAKE_SECRET_KEY,
  network: env.NETWORK,
  preloadSize: 500, // blocks to preload in nearlake
  s3AccessKey: env.S3_ACCESS_KEY,
  s3Bucket: env.S3_BUCKET,
  s3Endpoint: env.S3_ENDPOINT,
  s3Region: env.S3_REGION,
  s3SecretKey: env.S3_SECRET_KEY,
  startBlockHeight: env.S3_START_BLOCK,
};

export default config;
