import { cleanEnv, str, url } from 'envalid';

import { Network } from 'nb-types';

import { Config } from '#types/types';

const env = cleanEnv(process.env, {
  API_ACCESS_KEY: str(),
  API_URL: str({ default: 'https://api.nearblocks.io' }),
  CAMPAIGNS_PUBLIC_URL: str({ default: '' }),
  DATABASE_CA: str({ default: '' }),
  DATABASE_CERT: str({ default: '' }),
  DATABASE_KEY: str({ default: '' }),
  DB_URL_BALANCE: str(),
  DB_URL_BASE: str(),
  DB_URL_CONTRACT: str(),
  DB_URL_EVENTS: str(),
  DB_URL_SIGNATURE: str(),
  DB_URL_STAKING: str(),
  DB_URL_USER: str(),
  DB_WRITE_URL_BASE: str(),
  MAINNET_URL: str({ default: 'https://api.nearblocks.io' }),
  NETWORK: str({
    choices: [Network.MAINNET, Network.TESTNET],
  }),
  OTEL_EXPORTER_API_KEY: str({ default: '' }),
  OTEL_EXPORTER_OTLP_ENDPOINT: str({ default: '' }),
  OTEL_SERVICE_NAME: str({ default: '' }),
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
  TESTNET_URL: str({ default: 'https://api-testnet.nearblocks.io' }),
});

const config: Config = {
  apiAccessKey: env.API_ACCESS_KEY,
  apiUrl: env.API_URL,
  baseStart:
    env.NETWORK === Network.MAINNET
      ? 1595350551591948000n
      : 1596166782911378000n,
  campaignsPublicUrl: env.CAMPAIGNS_PUBLIC_URL,
  dbCa: env.DATABASE_CA,
  dbCert: env.DATABASE_CERT,
  dbKey: env.DATABASE_KEY,
  dbUrlBalance: env.DB_URL_BALANCE,
  dbUrlBase: env.DB_URL_BASE,
  dbUrlContract: env.DB_URL_CONTRACT,
  dbUrlEvents: env.DB_URL_EVENTS,
  dbUrlSignature: env.DB_URL_SIGNATURE,
  dbUrlStaking: env.DB_URL_STAKING,
  dbWriteUrlBase: env.DB_WRITE_URL_BASE,
  mainnetUrl: env.MAINNET_URL,
  maxQueryCost: 400000,
  maxQueryRows: 5000,
  network: env.NETWORK,
  otelExporterApiKey: env.OTEL_EXPORTER_API_KEY,
  otelExporterEndpoint: env.OTEL_EXPORTER_OTLP_ENDPOINT,
  otelServiceName: env.OTEL_SERVICE_NAME,
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
  testnetUrl: env.TESTNET_URL,
  userDbUrl: env.DB_URL_USER,
};

export default config;
