import { cleanEnv, str, url } from 'envalid';

import { types } from 'nb-lake';
import { Network } from 'nb-types';

import { DataSource } from '#types/enum';
import { Config } from '#types/types';

const env = cleanEnv(process.env, {
  DATABASE_CA: str({ default: '' }),
  DATABASE_CERT: str({ default: '' }),
  DATABASE_KEY: str({ default: '' }),
  DATABASE_URL: str(),
  DEX_DATA_SOURCE: str({
    choices: [DataSource.FAST_NEAR, DataSource.NEAR_LAKE],
    default: DataSource.NEAR_LAKE,
  }),
  FASTNEAR_ENDPOINT: str(),
  NETWORK: str({
    choices: [Network.MAINNET, Network.TESTNET],
  }),
  S3_ENDPOINT: url({ default: '' }),
  SENTRY_DSN: str({ default: '' }),
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
  dataSource: env.DEX_DATA_SOURCE,
  dbCa: env.DATABASE_CA,
  dbCert: env.DATABASE_CERT,
  dbKey: env.DATABASE_KEY,
  dbUrl: env.DATABASE_URL,
  delta: 500,
  fastnearEndpoint: env.FASTNEAR_ENDPOINT,
  genesisHeight,
  NEAR_TOKEN: 'wrap.near',
  network: env.NETWORK,
  preloadSize: 50,
  s3BucketName,
  s3Endpoint,
  s3RegionName: 'eu-central-1',
  sentryDsn: env.SENTRY_DSN,
  STABLE_TOKENS: [
    'usdt.tether-token.near', // USDt
    '17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1', // USDC
    'dac17f958d2ee523a2206206994597c13d831ec7.factory.bridge.near', // USDT.e
    'a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near', // USDC.e
    '6b175474e89094c44da98b954eedeac495271d0f.factory.bridge.near', // DAI
    // '853d955acef822db058eb8505911ed77f175b99e.factory.bridge.near', // FRAX
  ],
  startBlockHeight: 45_753_330,
};

export default config;
