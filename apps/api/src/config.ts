import { bool, cleanEnv, num, str, url } from 'envalid';

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
  // FastNear archival RPC endpoint the keyless proxy forwards POST /v1/rpc/archival to.
  FASTNEAR_ARCHIVAL_RPC_URL: str({
    default:
      process.env.NETWORK === Network.MAINNET
        ? 'https://archival-rpc.mainnet.fastnear.com'
        : 'https://archival-rpc.testnet.fastnear.com',
  }),
  // FastNear API key, server-only. Appended as ?apiKey=... when the proxy
  // forwards JSON-RPC to FastNear. Never logged, never stored in a URL field.
  FASTNEAR_RPC_KEY: str({ default: '' }),
  // FastNear default (non-archival) RPC endpoint the keyless proxy forwards to.
  FASTNEAR_RPC_URL: str({
    default:
      process.env.NETWORK === Network.MAINNET
        ? 'https://rpc.mainnet.fastnear.com'
        : 'https://rpc.testnet.fastnear.com',
  }),
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
  // Comma-separated Origin/Referer allowlist enforced by the rpcOrigin
  // middleware on the proxy routes. Empty allows same-origin/server callers.
  RPC_ALLOWED_ORIGINS: str({ default: '' }),
  // Window (seconds) for the dedicated per-IP proxy rate limiter.
  RPC_RATELIMIT_DURATION: num({ default: 60 }),
  // Per-IP request budget for the anonymous proxy within RPC_RATELIMIT_DURATION.
  // Intentionally generous: a single explorer pageview fans out into many view
  // calls, and shared NAT/CGNAT IPs carry many users. Real abuse is gated by
  // Turnstile (Phase 2), so this is only a coarse anti-scraper backstop.
  RPC_RATELIMIT_POINTS: num({ default: 1000 }),
  // Phase-2 feature flag. When true the rpcSession middleware requires a valid
  // session credential; when false it is a no-op (Phase-1 behaviour).
  RPC_SESSION_ENFORCED: bool({ default: false }),
  // HMAC secret used to sign/verify the short-lived (~30 min) RPC session.
  RPC_SESSION_SECRET: str({ default: '' }),
  RPC_URL: str(),
  SENTRY_DSN: str({ default: '' }),
  TESTNET_URL: str({ default: 'https://api-testnet.nearblocks.io' }),
  // Cloudflare Turnstile secret used by POST /v1/rpc/session to verify tokens.
  TURNSTILE_SECRET_KEY: str({ default: '' }),
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
  fastnearArchivalRpcUrl: env.FASTNEAR_ARCHIVAL_RPC_URL,
  fastnearRpcKey: env.FASTNEAR_RPC_KEY,
  fastnearRpcUrl: env.FASTNEAR_RPC_URL,
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
  rpcAllowedOrigins: env.RPC_ALLOWED_ORIGINS,
  rpcRateLimitDuration: env.RPC_RATELIMIT_DURATION,
  rpcRateLimitPoints: env.RPC_RATELIMIT_POINTS,
  rpcSessionEnforced: env.RPC_SESSION_ENFORCED,
  rpcSessionSecret: env.RPC_SESSION_SECRET,
  rpcUrl: env.RPC_URL,
  sentryDsn: env.SENTRY_DSN,
  stakingStart,
  testnetUrl: env.TESTNET_URL,
  turnstileSecretKey: env.TURNSTILE_SECRET_KEY,
  usageStreamMaxLen: env.USAGE_STREAM_MAXLEN,
  usageStreamRedisPassword: env.USAGE_STREAM_REDIS_PASSWORD,
  usageStreamRedisUrl: env.USAGE_STREAM_REDIS_URL,
  userDbUrl: env.DB_URL_USER,
};

export default config;
