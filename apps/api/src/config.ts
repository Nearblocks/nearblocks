import { cleanEnv, str } from 'envalid';

import { Network } from 'nb-types';

import { Config } from '#types/types';

const env = cleanEnv(process.env, {
  DATABASE_CA: str({ default: '' }),
  DATABASE_CERT: str({ default: '' }),
  DATABASE_KEY: str({ default: '' }),
  DATABASE_URL: str(),
  NETWORK: str({
    choices: [Network.MAINNET, Network.TESTNET],
  }),
  REDIS_URL: str(),
  RPC_URL: str(),
  SENTRY_DSN: str({ default: '' }),
  USER_DB_URL: str(),
  USER_REDIS_URL: str(),
});

const config: Config = {
  dbCa: env.DATABASE_CA,
  dbCert: env.DATABASE_CERT,
  dbKey: env.DATABASE_KEY,
  dbUrl: env.DATABASE_URL,
  maxQueryCost: 200000,
  maxQueryRows: 5000,
  network: env.NETWORK,
  port: 3001,
  redisUrl: env.REDIS_URL,
  rpcUrl: env.RPC_URL,
  sentryDsn: env.SENTRY_DSN,
  userDbUrl: env.USER_DB_URL,
  userRedisUrl: env.USER_REDIS_URL,
};

export default config;
