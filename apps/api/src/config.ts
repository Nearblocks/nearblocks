import { cleanEnv, str, url } from 'envalid';

import { Network } from 'nb-types';

import { Config } from '#types/types';

const env = cleanEnv(process.env, {
  API_ACCESS_KEY: str(),
  API_URL: str({ default: 'https://api.nearblocks.io' }),
  DATABASE_CA: str({ default: '' }),
  DATABASE_CERT: str({ default: '' }),
  DATABASE_KEY: str({ default: '' }),
  DATABASE_URL: str(),
  DATABASE_WRITE_URL: str(),
  IPS: str({ default: '' }),
  MAINNET_URL: str({ default: 'https://api.nearblocks.io' }),
  NETWORK: str({
    choices: [Network.MAINNET, Network.TESTNET],
  }),
  RATELIMITER_REDIS_PASSWORD: str({ default: '' }),
  RATELIMITER_REDIS_SENTINEL_NAME: str({ default: '' }),
  RATELIMITER_REDIS_SENTINEL_PASSWORD: str({ default: '' }),
  RATELIMITER_REDIS_SENTINEL_URLS: str({ default: '' }),
  RATELIMITER_REDIS_URL: url({ default: '' }),
  REDIS_PASSWORD: str({ default: '' }),
  REDIS_SENTINEL_NAME: str({ default: '' }),
  REDIS_SENTINEL_PASSWORD: str({ default: '' }),
  REDIS_SENTINEL_URLS: str({ default: '' }),
  REDIS_URL: url({ default: '' }),
  RPC_URL: str(),
  SENTRY_DSN: str({ default: '' }),
  SUBNETS: str({ default: '' }),
  TESTNET_URL: str({ default: 'https://api-testnet.nearblocks.io' }),
  USER_DB_URL: str(),
});

const config: Config = {
  apiAccessKey: env.API_ACCESS_KEY,
  apiUrl: env.API_URL,
  dbCa: env.DATABASE_CA,
  dbCert: env.DATABASE_CERT,
  dbKey: env.DATABASE_KEY,
  dbUrl: env.DATABASE_URL,
  dbWriteUrl: env.DATABASE_WRITE_URL,
  ips: env.IPS,
  mainnetUrl: env.MAINNET_URL,
  maxQueryCost: 400000,
  maxQueryRows: 5000,
  network: env.NETWORK,
  port: 3001,
  ratelimiterRedisPassword: env.RATELIMITER_REDIS_PASSWORD,
  ratelimiterRedisSentinelName: env.RATELIMITER_REDIS_SENTINEL_NAME,
  ratelimiterRedisSentinelPassword: env.RATELIMITER_REDIS_SENTINEL_PASSWORD,
  ratelimiterRedisSentinelUrls: env.RATELIMITER_REDIS_SENTINEL_URLS,
  ratelimiterRedisUrl: env.RATELIMITER_REDIS_URL,
  redisPassword: env.REDIS_PASSWORD,
  redisSentinelName: env.REDIS_SENTINEL_NAME,
  redisSentinelPassword: env.REDIS_SENTINEL_PASSWORD,
  redisSentinelUrls: env.REDIS_SENTINEL_URLS,
  redisUrl: env.REDIS_URL,
  rpcUrl: env.RPC_URL,
  sentryDsn: env.SENTRY_DSN,
  subnets: env.SUBNETS,
  testnetUrl: env.TESTNET_URL,
  userDbUrl: env.USER_DB_URL,
};

export default config;
