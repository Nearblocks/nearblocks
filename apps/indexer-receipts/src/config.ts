import { cleanEnv, str } from 'envalid';

import { Network } from 'nb-types';

import { Config } from '#types/types';

const env = cleanEnv(process.env, {
  DATABASE_CA: str({ default: '' }),
  DATABASE_CERT: str({ default: '' }),
  DATABASE_KEY: str({ default: '' }),
  DATABASE_URL: str(),
  FASTNEAR_API_KEY: str({ default: undefined }),
  NETWORK: str({
    choices: [Network.MAINNET, Network.TESTNET],
  }),
  READ_DATABASE_URL: str({ default: undefined }),
  SENTRY_DSN: str({ default: '' }),
});

const config: Config = {
  cacheItems: 300_000,
  dbCa: env.DATABASE_CA,
  dbCert: env.DATABASE_CERT,
  dbKey: env.DATABASE_KEY,
  dbUrl: env.DATABASE_URL,
  fastnearApiKey: env.FASTNEAR_API_KEY,
  insertLimit: 2500,
  network: env.NETWORK,
  readDbUrl: env.READ_DATABASE_URL,
  sentryDsn: env.SENTRY_DSN,
};

export default config;
