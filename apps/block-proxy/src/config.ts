import { bool, cleanEnv, num, port, str } from 'envalid';

import { logger } from 'nb-logger';

const env = cleanEnv(process.env, {
  ADMIN_PORT: port({ default: 3001 }),
  CACHE_COMPRESSION: bool({ default: false }),
  CACHE_DIR: str({ default: '/app/cache' }),
  CACHE_ENABLED: bool({ default: true }),
  CACHE_TTL_SECS: num({ default: 3600 }),
  DEDUP_TTL_SECS: num({ default: 25 }),
  FASTNEAR_API_KEY: str({ default: '' }),
  FASTNEAR_ENABLED: bool({ default: true }),
  FASTNEAR_URL: str({ default: '' }),
  LOG_LEVEL: str({ default: 'info' }),
  NETWORK: str({ choices: ['mainnet', 'testnet'], default: 'mainnet' }),
  PORT: port({ default: 3000 }),
  S3_ACCESS_KEY: str({ default: '' }),
  S3_BUCKET: str({ default: '' }),
  S3_ENABLED: bool({ default: false }),
  S3_ENDPOINT: str({ default: '' }),
  S3_REGION: str({ default: 'us-east-1' }),
  S3_SECRET_KEY: str({ default: '' }),
  STALL_TIMEOUT_SECS: num({ default: 90 }),
  // One timeout for every upstream, kept strictly below the client abort
  // (nb-neardata aborts at 30s). When these were equal, indexers gave up at
  // the same instant the proxy would have answered, so the whole fallback
  // chain and the 404-vs-502 distinction were invisible to them.
  UPSTREAM_TIMEOUT_SECS: num({ default: 10 }),
});

function deriveFastnearUrl(network: string, override_: string): string {
  if (override_) return override_;
  return network === 'testnet'
    ? 'https://testnet.neardata.xyz'
    : 'https://mainnet.neardata.xyz';
}

function mask(val: string): string {
  if (!val) return '<unset>';
  if (val.length <= 4) return '***';
  return `${val.slice(0, 4)}***`;
}

/**
 * nb-neardata aborts every attempt at 30s. A dedup entry older than that is
 * useless by construction: nobody is still waiting on it, and anyone who
 * attaches to it can never receive its result. So the TTL has a hard ceiling.
 */
const CLIENT_ABORT_SECS = 30;
const MIN_DEDUP_TTL_SECS = 5;

/** Mirrors READ_TIMEOUT_MS in cache/index.ts. */
const CACHE_READ_TIMEOUT_MS = 2_000;

// The stall window must exceed the longest a single request can legitimately
// take, or /livez reports a stall while the proxy is merely slow.
if (env.STALL_TIMEOUT_SECS <= env.DEDUP_TTL_SECS) {
  throw new Error(
    `STALL_TIMEOUT_SECS=${env.STALL_TIMEOUT_SECS} must exceed ` +
      `DEDUP_TTL_SECS=${env.DEDUP_TTL_SECS}: a request may legitimately run ` +
      `for the full dedup TTL, and reporting that as a stall would restart a ` +
      `healthy pod.`,
  );
}

const MIN_UPSTREAM_TIMEOUT_SECS = 1;

if (
  env.UPSTREAM_TIMEOUT_SECS < MIN_UPSTREAM_TIMEOUT_SECS ||
  env.UPSTREAM_TIMEOUT_SECS >= CLIENT_ABORT_SECS
) {
  throw new Error(
    `UPSTREAM_TIMEOUT_SECS=${env.UPSTREAM_TIMEOUT_SECS} is out of range: must ` +
      `be between ${MIN_UPSTREAM_TIMEOUT_SECS} and ${CLIENT_ABORT_SECS - 1}. ` +
      `At or below zero every upstream fetch aborts instantly; at or above ` +
      `the client abort the proxy can never answer before indexers give up.`,
  );
}

// S3 is only a real upstream when its credentials are present, so checking the
// flags alone would let a credential-less S3_ENABLED=true satisfy this guard
// while the proxy 502s every request. Mirror S3Upstream.create's test.
const s3Effective =
  env.S3_ENABLED &&
  !!env.S3_ENDPOINT &&
  !!env.S3_BUCKET &&
  !!env.S3_ACCESS_KEY &&
  !!env.S3_SECRET_KEY;

// With every source off the proxy starts happily and 502s every request. It
// is the sole block source for every indexer, so fail at boot instead.
if (!env.FASTNEAR_ENABLED && !s3Effective) {
  throw new Error(
    'no upstream enabled: set FASTNEAR_ENABLED=true (and/or S3_ENABLED=true). ' +
      'block-proxy cannot serve a single block with every source disabled.',
  );
}

if (
  env.DEDUP_TTL_SECS < MIN_DEDUP_TTL_SECS ||
  env.DEDUP_TTL_SECS > CLIENT_ABORT_SECS
) {
  throw new Error(
    `DEDUP_TTL_SECS=${env.DEDUP_TTL_SECS} is out of range: must be between ` +
      `${MIN_DEDUP_TTL_SECS} and ${CLIENT_ABORT_SECS} (the client abort). ` +
      `Below the range every request becomes its own leader and singleflight ` +
      `stops working; above it, entries outlive every waiter.`,
  );
}

if (env.CACHE_COMPRESSION) {
  throw new Error(
    'CACHE_COMPRESSION=true is not yet supported in the TypeScript port. ' +
      'Set CACHE_COMPRESSION=false or remove it to use uncompressed caching.',
  );
}

const config = {
  adminPort: env.ADMIN_PORT,
  cacheCompression: env.CACHE_COMPRESSION,
  cacheDir: env.CACHE_DIR,
  cacheEnabled: env.CACHE_ENABLED,
  cacheTtlSecs: env.CACHE_TTL_SECS,
  dedupTtlMs: env.DEDUP_TTL_SECS * 1000,
  fastnearApiKey: env.FASTNEAR_API_KEY,
  fastnearBaseUrl: deriveFastnearUrl(env.NETWORK, env.FASTNEAR_URL),
  fastnearEnabled: env.FASTNEAR_ENABLED,
  logLevel: env.LOG_LEVEL,
  network: env.NETWORK,
  port: env.PORT,
  s3AccessKey: env.S3_ACCESS_KEY,
  s3Bucket: env.S3_BUCKET,
  s3Enabled: env.S3_ENABLED,
  s3Endpoint: env.S3_ENDPOINT,
  s3Region: env.S3_REGION,
  s3SecretKey: env.S3_SECRET_KEY,
  stallTimeoutMs: env.STALL_TIMEOUT_SECS * 1000,
  upstreamTimeoutMs: env.UPSTREAM_TIMEOUT_SECS * 1000,
};

export type Config = typeof config;

/**
 * Worst case time one request can legitimately spend in the fallback chain.
 * If it exceeds the dedup TTL the deadline can fire on healthy-but-slow
 * requests; if it exceeds the client abort, indexers give up regardless.
 */
export function worstCaseChainMs(): number {
  const upstreams =
    (config.s3Enabled ? 1 : 0) + (config.fastnearEnabled ? 1 : 0);

  // The cache read is the first leg of the chain, not a free lookup.
  const cacheReadMs = config.cacheEnabled ? CACHE_READ_TIMEOUT_MS : 0;

  return cacheReadMs + config.upstreamTimeoutMs * upstreams;
}

export function logConfigSummary(): void {
  logger.info(
    {
      adminPort: config.adminPort,
      cacheCompression: config.cacheCompression,
      cacheDir: config.cacheDir,
      cacheEnabled: config.cacheEnabled,
      cacheTtlSecs: config.cacheTtlSecs,
      dedupTtlSecs: env.DEDUP_TTL_SECS,
      fastnearApiKey: mask(config.fastnearApiKey),
      fastnearEnabled: config.fastnearEnabled,
      fastnearUrl: config.fastnearBaseUrl,
      network: config.network,
      port: config.port,
      s3AccessKey: mask(config.s3AccessKey),
      s3Bucket: config.s3Bucket || '<unset>',
      s3EffectivelyEnabled:
        config.s3Enabled &&
        !!config.s3Endpoint &&
        !!config.s3Bucket &&
        !!config.s3AccessKey &&
        !!config.s3SecretKey,
      s3Enabled: config.s3Enabled,
      s3Endpoint: config.s3Endpoint || '<unset>',
      s3Region: config.s3Region,
      s3SecretKey: mask(config.s3SecretKey),
      stallTimeoutSecs: env.STALL_TIMEOUT_SECS,
      upstreamTimeoutSecs: env.UPSTREAM_TIMEOUT_SECS,
    },
    'block-proxy config',
  );

  const chainMs = worstCaseChainMs();

  if (chainMs > config.dedupTtlMs) {
    logger.warn(
      { chain_ms: chainMs, dedup_ttl_ms: config.dedupTtlMs },
      'upstream chain can outlast the dedup TTL; deadlines may fire on slow but healthy requests',
    );
  }

  if (chainMs > CLIENT_ABORT_SECS * 1000) {
    logger.warn(
      { chain_ms: chainMs, client_abort_ms: CLIENT_ABORT_SECS * 1000 },
      'upstream chain can outlast the client abort; indexers will give up before the proxy answers',
    );
  }
}

export default config;
