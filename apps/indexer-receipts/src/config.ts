import { cleanEnv, num, str, url } from 'envalid';

import { Network } from 'nb-types';

import { Config } from '#types/types';

const env = cleanEnv(process.env, {
  DATABASE_CA: str({ default: '' }),
  DATABASE_CERT: str({ default: '' }),
  DATABASE_KEY: str({ default: '' }),
  DATABASE_URL: str(),
  NEARDATA_URL: url(),
  NETWORK: str({
    choices: [Network.MAINNET, Network.TESTNET],
  }),
  RECEIPTS_INDEXER_KEY: str(),
  RECEIPTS_START_BLOCK: num({ default: 0 }),
  SENTRY_DSN: str({ default: '' }),
});

const genesisHeight = env.NETWORK === Network.MAINNET ? 9_820_210 : 42_376_888;

const config: Config = {
  cacheItems: 300_000,
  dbCa: env.DATABASE_CA,
  dbCert: env.DATABASE_CERT,
  dbKey: env.DATABASE_KEY,
  dbUrl: env.DATABASE_URL,
  genesisHeight,
  indexerKey: env.RECEIPTS_INDEXER_KEY,
  insertLimit: 2500,
  neardataUrl: env.NEARDATA_URL,
  network: env.NETWORK,
  sentryDsn: env.SENTRY_DSN,
  startBlockHeight: env.RECEIPTS_START_BLOCK,
};

export default config;
