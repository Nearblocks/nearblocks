import { cleanEnv, num, str, url } from 'envalid';

import { logger } from 'nb-logger';
import { Network } from 'nb-types';

import { Config } from '#types/types';

// Backwards compatibility: older deployments configured a single DATABASE_URL.
// When set, it becomes the default for every per-domain connection string, so a
// single-database setup keeps working without listing each DB_URL_* var. Any
// individual var still overrides it. Without DATABASE_URL the vars stay required.
const dbFallback = process.env.DATABASE_URL
  ? { default: process.env.DATABASE_URL }
  : {};

const env = cleanEnv(process.env, {
  API_ACCESS_KEY: str(),
  API_URL: str({ default: 'https://api.nearblocks.io' }),
  CAMPAIGNS_PUBLIC_URL: str({ default: '' }),
  DATABASE_CA: str({ default: '' }),
  DATABASE_CERT: str({ default: '' }),
  DATABASE_KEY: str({ default: '' }),
  DB_URL_BALANCE: str(dbFallback),
  DB_URL_BASE: str(dbFallback),
  DB_URL_CONTRACT: str(dbFallback),
  DB_URL_EVENTS: str(dbFallback),
  DB_URL_MULTICHAIN: str(dbFallback),
  DB_URL_STAKING: str(dbFallback),
  DB_URL_USER: str(dbFallback),
  DB_WRITE_URL_BASE: str(dbFallback),
  FASTNEAR_API_KEY: str({ default: '' }),
  FASTNEAR_URL: str({ default: 'https://api.fastnear.com' }),
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
  RPC_AUTH_TOKENS: str({ default: '' }),
  RPC_URL: str({ default: '' }),
  RPC_URLS: str({ default: '' }),
  SENTRY_DSN: str({ default: '' }),
  TESTNET_URL: str({ default: 'https://api-testnet.nearblocks.io' }),
  // Hard ceiling on the buffered usage events; bounds memory if the
  // consumer stalls. ~500k events ≈ tens of MB. Set 0 to disable capture.
  USAGE_STREAM_MAXLEN: num({ default: 500_000 }),
  // Optional dedicated store for the usage event stream; falls back to the
  // rate-limiter store when unset.
  USAGE_STREAM_REDIS_PASSWORD: str({ default: '' }),
  USAGE_STREAM_REDIS_URL: url({ default: '' }),
});

const baseStart =
  env.NETWORK === Network.MAINNET ? 1595350551591948000n : 1596166782911378000n;
const balanceStart =
  env.NETWORK === Network.MAINNET ? 1595368210762782796n : 1617306016933517888n;
const eventsStart =
  env.NETWORK === Network.MAINNET ? 1613604394034862539n : 1636002073366363339n;
const stakingStart =
  env.NETWORK === Network.MAINNET ? 1598366210034965101n : 1617308117501240699n;
const fastNearRpcFallback = () => {
  if (!env.FASTNEAR_API_KEY) return undefined;

  return `https://archival-rpc.${env.NETWORK}.fastnear.com`;
};
const splitList = (value: string) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
// RPC_URLS lists endpoints in priority order. RPC_URL is deprecated and only
// read when RPC_URLS is unset.
if (env.RPC_URL && env.RPC_URLS) {
  if (splitList(env.RPC_URL).join() !== splitList(env.RPC_URLS).join())
    logger.warn('RPC_URL is deprecated and ignored; using RPC_URLS.');
} else if (env.RPC_URL) {
  logger.warn('RPC_URL is deprecated; use RPC_URLS.');
}
const configuredRpcUrls = splitList(env.RPC_URLS || env.RPC_URL);
// A single deprecated RPC_URL keeps the FastNear archival fallback that
// FASTNEAR_API_KEY adds, as before; RPC_URLS is used exactly as given.
const rpcUrls =
  !env.RPC_URLS && configuredRpcUrls.length === 1
    ? [configuredRpcUrls[0], fastNearRpcFallback()].filter(
        (value): value is string => !!value,
      )
    : configuredRpcUrls;
if (!rpcUrls.length) throw new Error('Set RPC_URLS.');
if (new Set(rpcUrls).size !== rpcUrls.length) {
  throw new Error('RPC_URLS must not contain duplicate endpoints.');
}
for (const endpoint of rpcUrls) {
  const url = new URL(endpoint);
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('RPC_URLS endpoints must use HTTP or HTTPS.');
  }
}
const rpcAuthTokens = env.RPC_AUTH_TOKENS
  ? env.RPC_AUTH_TOKENS.split(',').map((value) => value.trim())
  : rpcUrls.map((endpoint) =>
      env.FASTNEAR_API_KEY &&
      new URL(endpoint).hostname.endsWith('fastnear.com')
        ? env.FASTNEAR_API_KEY
        : '',
    );
if (rpcAuthTokens.length !== rpcUrls.length) {
  throw new Error('RPC_AUTH_TOKENS must have one entry per RPC_URLS endpoint.');
}

const config: Config = {
  apiAccessKey: env.API_ACCESS_KEY,
  apiUrl: env.API_URL,
  balanceStart,
  baseStart,
  campaignsPublicUrl: env.CAMPAIGNS_PUBLIC_URL,
  dbCa: env.DATABASE_CA,
  dbCert: env.DATABASE_CERT,
  dbKey: env.DATABASE_KEY,
  dbUrlBalance: env.DB_URL_BALANCE,
  dbUrlBase: env.DB_URL_BASE,
  dbUrlContract: env.DB_URL_CONTRACT,
  dbUrlEvents: env.DB_URL_EVENTS,
  dbUrlMultichain: env.DB_URL_MULTICHAIN,
  dbUrlStaking: env.DB_URL_STAKING,
  dbWriteUrlBase: env.DB_WRITE_URL_BASE,
  eventsStart,
  fastnearApiKey: env.FASTNEAR_API_KEY,
  fastnearUrl: env.FASTNEAR_URL,
  mainnetUrl: env.MAINNET_URL,
  maxQueryCost: 400000,
  maxQueryCount: 10000,
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
  rpcAuthTokens,
  rpcUrl: rpcUrls[0],
  rpcUrls,
  sentryDsn: env.SENTRY_DSN,
  stakingStart,
  testnetUrl: env.TESTNET_URL,
  usageStreamMaxLen: env.USAGE_STREAM_MAXLEN,
  usageStreamRedisPassword: env.USAGE_STREAM_REDIS_PASSWORD,
  usageStreamRedisUrl: env.USAGE_STREAM_REDIS_URL,
  userDbUrl: env.DB_URL_USER,
};

export default config;
