import { cleanEnv, str, url } from 'envalid';

import { Network } from 'nb-types';

import { Config } from '#types/types';

const env = cleanEnv(process.env, {
  COINGECKO_API_KEY: str(),
  COINMARKETCAP_API_KEY: str(),
  DATABASE_CA: str({ default: '' }),
  DATABASE_CERT: str({ default: '' }),
  DATABASE_KEY: str({ default: '' }),
  DATABASE_URL: str(),
  LIVECOINWATCH_API_KEY: str(),
  NETWORK: str({
    choices: [Network.MAINNET, Network.TESTNET],
  }),
  REDIS_PASSWORD: str({ default: '' }),
  REDIS_SENTINEL_NAME: str({ default: '' }),
  REDIS_SENTINEL_URLS: str({ default: '' }),
  REDIS_URL: url({ default: '' }),
  RPC_URL: str(),
  RPC_URL2: str(),
  SENTRY_DSN: str({ default: '' }),
});

const genesisHeight = env.NETWORK === Network.MAINNET ? 9820210 : 42376888;
const genesisDate =
  env.NETWORK === Network.MAINNET ? '2020-07-21' : '2021-04-01';
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
  network: env.NETWORK,
  redisPassword: env.REDIS_PASSWORD,
  redisSentinelName: env.REDIS_SENTINEL_NAME,
  redisSentinelUrls: env.REDIS_SENTINEL_URLS,
  redisUrl: env.REDIS_URL,
  rpcUrl: env.RPC_URL,
  rpcUrl2: env.RPC_URL2,
  sentryDsn,
};

export default config;
