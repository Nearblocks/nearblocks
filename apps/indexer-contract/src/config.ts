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
  SENTRY_DSN: str({ default: '' }),
});

const startHeight = env.NETWORK === Network.MAINNET ? 146_051_440 : 192_898_203;
const stopHeight = env.NETWORK === Network.MAINNET ? 206_240_000 : 258_460_000;

const config: Config = {
  dbCa: env.DATABASE_CA,
  dbCert: env.DATABASE_CERT,
  dbKey: env.DATABASE_KEY,
  dbUrl: env.DATABASE_URL,
  endBlockHeight: stopHeight,
  fastnearApiKey: env.FASTNEAR_API_KEY,
  indexerKey: 'contracts_global',
  network: env.NETWORK,
  sentryDsn: env.SENTRY_DSN,
  startBlockHeight: startHeight,
};

export default config;
