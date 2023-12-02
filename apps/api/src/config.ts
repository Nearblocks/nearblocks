import { cleanEnv, str } from 'envalid';

import { Network } from 'nb-types';

import { Config } from '#types/types';

const env = cleanEnv(process.env, {
  DATABASE_URL: str(),
  MAINNET_DB_URL: str(),
  MAINNET_REDIS_URL: str(),
  NETWORK: str({
    choices: [Network.MAINNET, Network.TESTNET],
  }),
  REDIS_URL: str(),
  RPC_URL: str(),
  SENTRY_DSN: str({ default: '' }),
});

const config: Config = {
  dbUrl: env.DATABASE_URL,
  mainnetDbUrl: env.MAINNET_DB_URL,
  mainnetRedisUrl: env.MAINNET_REDIS_URL,
  maxQueryCost: 200000,
  maxQueryRows: 5000,
  network: env.NETWORK,
  port: 3001,
  redisUrl: env.REDIS_URL,
  rpcUrl: env.RPC_URL,
  sentryDsn: env.SENTRY_DSN,
};

export default config;
