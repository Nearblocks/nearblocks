import { cleanEnv, num, str } from 'envalid';

import { Network } from 'nb-types';

import { Config } from '#types/types';

const env = cleanEnv(process.env, {
  DATABASE_CA: str({ default: '' }),
  DATABASE_CERT: str({ default: '' }),
  DATABASE_KEY: str({ default: '' }),
  DATABASE_URL: str(),
  DATABASE_URL_BASE: str({ default: '' }),
  NETWORK: str({
    choices: [Network.MAINNET, Network.TESTNET],
  }),
  PROXY_URL: str(),
  SENTRY_DSN: str({ default: '' }),
  STAKING_INDEXER_KEY: str(),
  STAKING_START_BLOCK: num({ default: 0 }),
});

const config: Config = {
  dbCa: env.DATABASE_CA,
  dbCert: env.DATABASE_CERT,
  dbKey: env.DATABASE_KEY,
  dbUrl: env.DATABASE_URL,
  dbUrlBase: env.DATABASE_URL_BASE,
  indexerKey: env.STAKING_INDEXER_KEY,
  network: env.NETWORK,
  proxyUrl: env.PROXY_URL,
  sentryDsn: env.SENTRY_DSN,
  startBlockHeight: env.STAKING_START_BLOCK,
};

export default config;
