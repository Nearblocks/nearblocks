import { cleanEnv, str } from 'envalid';

import { Network } from 'nb-types';

import { Config } from '#types/types';

const env = cleanEnv(process.env, {
  COINGECKO_API_KEY: str(),
  COINMARKETCAP_API_KEY: str(),
  DATABASE_CA: str({ default: '' }),
  DATABASE_CERT: str({ default: '' }),
  DATABASE_KEY: str({ default: '' }),
  DB_URL_BASE: str(),
  DB_URL_CONTRACTS: str(),
  DB_URL_EVENTS: str(),
  NETWORK: str({
    choices: [Network.MAINNET, Network.TESTNET],
  }),
  RPC_URL: str(),
  SENTRY_DSN: str({ default: '' }),
});

const genesisHeight = env.NETWORK === Network.MAINNET ? 9820210 : 42376888;
const genesisDate =
  env.NETWORK === Network.MAINNET ? '2020-07-21' : '2021-04-01';

const config: Config = {
  cgApiKey: env.COINGECKO_API_KEY,
  cmcApiKey: env.COINMARKETCAP_API_KEY,
  dbCa: env.DATABASE_CA,
  dbCert: env.DATABASE_CERT,
  dbKey: env.DATABASE_KEY,
  dbUrlBase: env.DB_URL_BASE,
  dbUrlContracts: env.DB_URL_CONTRACTS,
  dbUrlEvents: env.DB_URL_EVENTS,
  genesisDate,
  genesisHeight,
  network: env.NETWORK,
  rpcUrl: env.RPC_URL,
  sentryDsn: env.SENTRY_DSN,
};

export default config;
