import { bool, cleanEnv, num, str, url } from 'envalid';

import { Network } from 'nb-types';

import { Config } from '#types/types';

const env = cleanEnv(process.env, {
  DATABASE_CA: str({ default: '' }),
  DATABASE_CERT: str({ default: '' }),
  DATABASE_KEY: str({ default: '' }),
  DATABASE_URL_BASE: str(),
  DATABASE_URL_CONTRACT: str(),
  DATABASE_URL_EVENTS: str(),
  FT_FINDER_BUCKET_HOURS: num({ default: 1 }),
  FT_FINDER_FROM_SCRATCH: bool({ default: false }),
  NETWORK: str({
    choices: [Network.MAINNET, Network.TESTNET],
  }),
  RPC_URL: url(),
  SENTRY_DSN: str({ default: '' }),
});

const config: Config = {
  bucketHours: env.FT_FINDER_BUCKET_HOURS,
  dbCa: env.DATABASE_CA,
  dbCert: env.DATABASE_CERT,
  dbKey: env.DATABASE_KEY,
  dbUrlBase: env.DATABASE_URL_BASE,
  dbUrlContract: env.DATABASE_URL_CONTRACT,
  dbUrlEvents: env.DATABASE_URL_EVENTS,
  fromScratch: env.FT_FINDER_FROM_SCRATCH,
  insertLimit: 2_000,
  network: env.NETWORK,
  rpcDelayMs: 100,
  rpcUrl: env.RPC_URL,
  sentryDsn: env.SENTRY_DSN,
  verifySamples: 3,
};

export default config;
