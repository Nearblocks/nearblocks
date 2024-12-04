import { cleanEnv, num, str } from 'envalid';

import { Network } from 'nb-types';

import { Config } from '#types/types';

const env = cleanEnv(process.env, {
  DATABASE_CA: str({ default: '' }),
  DATABASE_CERT: str({ default: '' }),
  DATABASE_KEY: str({ default: '' }),
  DATABASE_URL: str(),
  DATABASE_URL_READ: str({ default: '' }),
  EVENTS_START_BLOCK: num({ default: 0 }),
  NETWORK: str({
    choices: [Network.MAINNET, Network.TESTNET],
  }),
  SENTRY_DSN: str({ default: '' }),
});

const genesisHeight = env.NETWORK === Network.MAINNET ? 9_820_210 : 42_376_888;

const config: Config = {
  dbCa: env.DATABASE_CA,
  dbCert: env.DATABASE_CERT,
  dbKey: env.DATABASE_KEY,
  dbUrl: env.DATABASE_URL,
  dbUrlRead: env.DATABASE_URL_READ,
  genesisHeight,
  network: env.NETWORK,
  sentryDsn: env.SENTRY_DSN,
  startBlockHeight: env.EVENTS_START_BLOCK,
};

export default config;
