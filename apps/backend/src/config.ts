import { cleanEnv, str } from 'envalid';

import { Network } from '#types/enums';
import { Config } from '#types/types';

const env = cleanEnv(process.env, {
  COINGECKO_API_KEY: str(),
  COINMARKETCAP_API_KEY: str(),
  DATABASE_CA: str({ default: '' }),
  DATABASE_CERT: str({ default: '' }),
  DATABASE_KEY: str({ default: '' }),
  DATABASE_URL: str(),
  LIVECOINWATCH_API_KEY: str(),
  NETWORK: str(),
  RPC_URL: str(),
  SENTRY_DSN: str({ default: '' }),
});

const network: Network =
  process.env.NETWORK === Network.TESTNET ? Network.TESTNET : Network.MAINNET;
const genesisHeight = network === Network.MAINNET ? 9820210 : 42376888;
const genesisDate = network === Network.MAINNET ? '2020-07-21' : '2021-04-01';
const sentryDsn = process.env.SENTRY_DSN;

const config: Config = {
  cmcApiKey: env.COINMARKETCAP_API_KEY,
  coingeckoApiKey: env.COINGECKO_API_KEY,
  dbCa: env.DATABASE_CA,
  dbCert: env.DATABASE_CERT,
  dbKey: env.DATABASE_KEY,
  dbUrl: env.DATABASE_URL,
  genesisDate,
  genesisHeight,
  lcwApiKey: env.LIVECOINWATCH_API_KEY,
  network,
  rpcUrl: env.RPC_URL,
  sentryDsn,
};

export default config;
