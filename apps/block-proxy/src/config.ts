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
  // One timeout for every upstream, kept below the client abort. When equal,
  // indexers gave up before the proxy could answer.
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

// nb-neardata aborts every attempt at 30s, which bounds every timeout here.
const CLIENT_ABORT_SECS = 30;

/** Hard bound on one cache read. Not an operational knob. */
export const CACHE_READ_TIMEOUT_MS = 2_000;

// Mirrors S3Upstream.create: the flag alone does not make S3 usable.
const s3Ready =
  env.S3_ENABLED &&
  !!env.S3_ENDPOINT &&
  !!env.S3_BUCKET &&
  !!env.S3_ACCESS_KEY &&
  !!env.S3_SECRET_KEY;

// Longest a healthy request can take: one cache read plus every upstream.
const chainSecs =
  (env.CACHE_ENABLED ? CACHE_READ_TIMEOUT_MS / 1000 : 0) +
  env.UPSTREAM_TIMEOUT_SECS *
    ((env.FASTNEAR_ENABLED ? 1 : 0) + (s3Ready ? 1 : 0));

if (!env.FASTNEAR_ENABLED && !s3Ready) {
  throw new Error(
    'no working upstream: set FASTNEAR_ENABLED=true, or S3_ENABLED=true with ' +
      'S3_ENDPOINT/S3_BUCKET/S3_ACCESS_KEY/S3_SECRET_KEY all set.',
  );
}

if (
  env.UPSTREAM_TIMEOUT_SECS < 1 ||
  env.UPSTREAM_TIMEOUT_SECS >= CLIENT_ABORT_SECS
) {
  throw new Error(
    `UPSTREAM_TIMEOUT_SECS=${env.UPSTREAM_TIMEOUT_SECS} must be between 1 and ` +
      `${
        CLIENT_ABORT_SECS - 1
      }: at zero every fetch aborts instantly, and at ` +
      `the client abort the proxy can never answer before indexers give up.`,
  );
}

// Below the chain the deadline fires on healthy requests; above the client
// abort the entry outlives every waiter.
if (env.DEDUP_TTL_SECS <= chainSecs || env.DEDUP_TTL_SECS > CLIENT_ABORT_SECS) {
  throw new Error(
    `DEDUP_TTL_SECS=${env.DEDUP_TTL_SECS} must be above the ${chainSecs}s ` +
      `upstream chain and at most ${CLIENT_ABORT_SECS}s (the client abort).`,
  );
}

// A request may legitimately run for the full dedup TTL; calling that a stall
// would restart a healthy pod.
if (env.STALL_TIMEOUT_SECS <= env.DEDUP_TTL_SECS) {
  throw new Error(
    `STALL_TIMEOUT_SECS=${env.STALL_TIMEOUT_SECS} must exceed ` +
      `DEDUP_TTL_SECS=${env.DEDUP_TTL_SECS}.`,
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
}

export default config;
