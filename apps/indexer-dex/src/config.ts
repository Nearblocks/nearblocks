import { cleanEnv, num, str, url } from 'envalid';

import { Network } from 'nb-types';

import { Config } from '#types/types';

const env = cleanEnv(process.env, {
  DATABASE_CA: str({ default: '' }),
  DATABASE_CERT: str({ default: '' }),
  DATABASE_KEY: str({ default: '' }),
  DATABASE_URL: str(),
  DATABASE_URL_READ: str({ default: '' }),
  DEX_START_BLOCK: num({ default: 45_753_330 }),
  NETWORK: str({
    choices: [Network.MAINNET],
  }),
  S3_ACCESS_KEY: str(),
  S3_BUCKET: str({ default: 'nearblocks' }),
  S3_ENDPOINT: url(),
  S3_REGION: str({ default: '' }),
  S3_SECRET_KEY: str(),
  SENTRY_DSN: str({ default: '' }),
});

const config: Config = {
  dbCa: env.DATABASE_CA,
  dbCert: env.DATABASE_CERT,
  dbKey: env.DATABASE_KEY,
  dbUrl: env.DATABASE_URL,
  dbUrlRead: env.DATABASE_URL_READ,
  NEAR_TOKEN: 'wrap.near',
  network: env.NETWORK,
  s3AccessKey: env.S3_ACCESS_KEY,
  s3Bucket: env.S3_BUCKET,
  s3Endpoint: env.S3_ENDPOINT,
  s3Region: env.S3_REGION,
  s3SecretKey: env.S3_SECRET_KEY,
  sentryDsn: env.SENTRY_DSN,
  STABLE_TOKENS: [
    'usdt.tether-token.near', // USDt
    '17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1', // USDC
    'dac17f958d2ee523a2206206994597c13d831ec7.factory.bridge.near', // USDT.e
    'a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near', // USDC.e
    '6b175474e89094c44da98b954eedeac495271d0f.factory.bridge.near', // DAI
    // '853d955acef822db058eb8505911ed77f175b99e.factory.bridge.near', // FRAX
  ],
  startBlockHeight: env.DEX_START_BLOCK,
};

export default config;
