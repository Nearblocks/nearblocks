import { cleanEnv, str, url } from 'envalid';

import { types } from 'nb-lake';
import { Network } from 'nb-types';

import { Config } from '#types/types';

const env = cleanEnv(process.env, {
  DATABASE_CA: str({ default: '' }),
  DATABASE_CERT: str({ default: '' }),
  DATABASE_KEY: str({ default: '' }),
  DATABASE_URL: str(),
  NETWORK: str({
    choices: [Network.MAINNET, Network.TESTNET],
  }),
  RPC_URL: str(),
  S3_ENDPOINT: url({ default: '' }),
  SENTRY_DSN: str({ default: '' }),
});

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
  dbCa: env.DATABASE_CA,
  dbCert: env.DATABASE_CERT,
  dbKey: env.DATABASE_KEY,
  dbUrl: env.DATABASE_URL,
  delta: 100,
  NEAR_TOKEN: 'wrap.near',
  network: env.NETWORK,
  preloadSize: 10,
  rpcUrl: env.RPC_URL,
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
