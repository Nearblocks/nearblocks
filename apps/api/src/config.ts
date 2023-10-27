import { cleanEnv, str } from 'envalid';

import { Config } from '#ts/types';
import { Network } from '#ts/enums';

const env = cleanEnv(process.env, {
  DATABASE_URL: str(),
  REDIS_URL: str(),
  MAINNET_DB_URL: str(),
  MAINNET_REDIS_URL: str(),
  RPC_NODE_URL: str(),
  API_FETCH_KEY: str(),
  SENTRY_DSN: str({ default: '' }),
  NETWORK: str({
    choices: [Network.MAINNET, Network.TESTNET],
  }),
  NODE_ENV: str({
    choices: ['development', 'production'],
    default: 'development',
  }),
});

const config: Config = {
  port: 3001,
  dbUrl: env.DATABASE_URL,
  redisUrl: env.REDIS_URL,
  mainnetDbUrl: env.MAINNET_DB_URL,
  mainnetRedisUrl: env.MAINNET_REDIS_URL,
  rpcUrl: env.RPC_NODE_URL,
  apiFetchKey: env.API_FETCH_KEY,
  sentryDsn: env.SENTRY_DSN,
  network: env.NETWORK,
  maxQueryRows: 5000,
  maxQueryCost: 200000,
  apiOrigin: env.isProd
    ? env.NETWORK === Network.MAINNET
      ? 'api.nearblocks.io'
      : 'api-testnet.nearblocks.io'
    : 'localhost:3000',
};

export default config;
