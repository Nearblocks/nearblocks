import { cleanEnv, str } from 'envalid';

import { Network } from 'nb-types';

import { Config } from '#types/types';

const env = cleanEnv(process.env, {
  DATABASE_CA: str({ default: '' }),
  DATABASE_CERT: str({ default: '' }),
  DATABASE_KEY: str({ default: '' }),
  DATABASE_URL: str(),
  FASTNEAR_API_KEY: str({ default: undefined }),
  NEARDATA_CONCURRENCY: str({ default: 'auto' }),
  NEARDATA_URL: str({ default: undefined }),
  NETWORK: str({
    choices: [Network.MAINNET, Network.TESTNET],
  }),
  SENTRY_DSN: str({ default: '' }),
});

const INDEXER_KEY = 'ft_state';

const startBlockHeight =
  env.NETWORK === Network.MAINNET ? 30_119_194 : 42_377_765;

const config: Config = {
  dbCa: env.DATABASE_CA,
  dbCert: env.DATABASE_CERT,
  dbKey: env.DATABASE_KEY,
  dbUrl: env.DATABASE_URL,
  fastnearApiKey: env.FASTNEAR_API_KEY,
  indexerKey: INDEXER_KEY,
  insertLimit: 2500,
  neardataConcurrency:
    env.NEARDATA_CONCURRENCY === 'auto'
      ? 'auto'
      : Number(env.NEARDATA_CONCURRENCY),
  neardataUrl: env.NEARDATA_URL,
  network: env.NETWORK,
  rawLag: 2_000,
  rawThreshold: 5_000,
  sentryDsn: env.SENTRY_DSN,
  startBlockHeight,
};

export default config;
