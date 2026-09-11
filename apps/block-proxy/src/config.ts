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
  NEARDATA_COOLDOWN_BASE_SECS: num({ default: 60 }),
  NEARDATA_COOLDOWN_MAX_SECS: num({ default: 900 }),
  NEARDATA_UPSTREAMS: str({ default: '' }),
  NETWORK: str({ choices: ['mainnet', 'testnet'], default: 'mainnet' }),
  PORT: port({ default: 3000 }),
  S3_ACCESS_KEY: str({ default: '' }),
  S3_BUCKET: str({ default: '' }),
  S3_ENABLED: bool({ default: false }),
  S3_ENDPOINT: str({ default: '' }),
  S3_REGION: str({ default: 'us-east-1' }),
  S3_SECRET_KEY: str({ default: '' }),
  // One timeout for every upstream, kept below the client abort. When equal,
  // indexers gave up before the proxy could answer.
  UPSTREAM_TIMEOUT_SECS: num({ default: 10 }),
});

/**
 * One neardata-compatible endpoint. `name` labels its metrics and stats, so it
 * has to be unique and stable across restarts.
 */
export type UpstreamConfig = {
  apiKey: string;
  name: string;
  url: string;
};

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

const stripTrailingSlash = (url: string): string => url.replace(/\/+$/, '');

/** Names used internally as error and stat sources; an upstream cannot take one. */
const RESERVED_NAMES = new Set(['cache', 'dedup', 's3']);

/**
 * Parses NEARDATA_UPSTREAMS into an ordered pool. List order is priority order.
 * An unset value yields a single entry from the legacy FASTNEAR_* vars, so
 * existing deployments keep their exact behaviour.
 */
function parseUpstreams(
  raw: string,
  fallback: UpstreamConfig,
): UpstreamConfig[] {
  if (!raw.trim()) return [fallback];

  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new Error(`NEARDATA_UPSTREAMS is not valid JSON: ${err}`);
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error(
      'NEARDATA_UPSTREAMS must be a non-empty JSON array of ' +
        '{"name":...,"url":...,"apiKey":...}. Leave it unset to use FASTNEAR_URL.',
    );
  }

  const seen = new Set<string>();

  return parsed.map((entry, index) => {
    if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) {
      throw new Error(`NEARDATA_UPSTREAMS[${index}] must be an object.`);
    }

    const { apiKey, name, url } = entry as Record<string, unknown>;

    if (typeof name !== 'string' || !name.trim() || name !== name.trim()) {
      throw new Error(
        `NEARDATA_UPSTREAMS[${index}].name must be a non-empty, untrimmed-free string.`,
      );
    }

    if (RESERVED_NAMES.has(name)) {
      throw new Error(
        `NEARDATA_UPSTREAMS[${index}].name "${name}" is reserved. Those names ` +
          'already identify internal sources in errors and stats.',
      );
    }

    if (seen.has(name)) {
      throw new Error(
        `NEARDATA_UPSTREAMS has a duplicate name "${name}". Names label ` +
          'metrics and stats, so they must be unique.',
      );
    }

    seen.add(name);

    if (typeof url !== 'string' || !/^https?:\/\//i.test(url)) {
      throw new Error(
        `NEARDATA_UPSTREAMS[${index}].url must be an http(s) URL, got: ${String(
          url,
        )}`,
      );
    }

    let parsed: URL;

    try {
      parsed = new URL(url);
    } catch {
      throw new Error(
        `NEARDATA_UPSTREAMS[${index}].url is not a valid URL: ${url}`,
      );
    }

    // Request paths are appended to this base, so a query or fragment would
    // swallow them and the endpoint would answer a different question than
    // the one asked — while still looking like a valid 200.
    if (parsed.search || parsed.hash) {
      throw new Error(
        `NEARDATA_UPSTREAMS[${index}].url must not carry a query string or ` +
          `fragment: ${url}`,
      );
    }

    if (apiKey !== undefined && typeof apiKey !== 'string') {
      throw new Error(
        `NEARDATA_UPSTREAMS[${index}].apiKey must be a string when set.`,
      );
    }

    return { apiKey: apiKey ?? '', name, url: stripTrailingSlash(url) };
  });
}

// Mirrors S3Upstream.create: the flag alone does not make S3 usable.
const s3Ready =
  env.S3_ENABLED &&
  !!env.S3_ENDPOINT &&
  !!env.S3_BUCKET &&
  !!env.S3_ACCESS_KEY &&
  !!env.S3_SECRET_KEY;

if (!env.FASTNEAR_ENABLED && !s3Ready) {
  throw new Error(
    'no working upstream: set FASTNEAR_ENABLED=true, or S3_ENABLED=true with ' +
      'S3_ENDPOINT/S3_BUCKET/S3_ACCESS_KEY/S3_SECRET_KEY all set.',
  );
}

if (env.UPSTREAM_TIMEOUT_SECS < 1) {
  throw new Error(
    `UPSTREAM_TIMEOUT_SECS=${env.UPSTREAM_TIMEOUT_SECS} must be at least 1: ` +
      'at zero every upstream fetch aborts instantly.',
  );
}

if (env.DEDUP_TTL_SECS < 5 || env.DEDUP_TTL_SECS > 60) {
  throw new Error(`DEDUP_TTL_SECS=${env.DEDUP_TTL_SECS} must be 5-60.`);
}

if (env.NEARDATA_COOLDOWN_BASE_SECS < 1) {
  throw new Error(
    `NEARDATA_COOLDOWN_BASE_SECS=${env.NEARDATA_COOLDOWN_BASE_SECS} must be at least 1.`,
  );
}

if (env.NEARDATA_COOLDOWN_MAX_SECS < env.NEARDATA_COOLDOWN_BASE_SECS) {
  throw new Error(
    `NEARDATA_COOLDOWN_MAX_SECS=${env.NEARDATA_COOLDOWN_MAX_SECS} must be >= ` +
      `NEARDATA_COOLDOWN_BASE_SECS=${env.NEARDATA_COOLDOWN_BASE_SECS}.`,
  );
}

if (env.CACHE_COMPRESSION) {
  throw new Error(
    'CACHE_COMPRESSION=true is not yet supported in the TypeScript port. ' +
      'Set CACHE_COMPRESSION=false or remove it to use uncompressed caching.',
  );
}

const upstreams = env.FASTNEAR_ENABLED
  ? parseUpstreams(env.NEARDATA_UPSTREAMS, {
      apiKey: env.FASTNEAR_API_KEY,
      name: 'fastnear',
      url: stripTrailingSlash(deriveFastnearUrl(env.NETWORK, env.FASTNEAR_URL)),
    })
  : [];

const config = {
  adminPort: env.ADMIN_PORT,
  cacheCompression: env.CACHE_COMPRESSION,
  cacheDir: env.CACHE_DIR,
  cacheEnabled: env.CACHE_ENABLED,
  cacheTtlSecs: env.CACHE_TTL_SECS,
  cooldownBaseMs: env.NEARDATA_COOLDOWN_BASE_SECS * 1000,
  cooldownMaxMs: env.NEARDATA_COOLDOWN_MAX_SECS * 1000,
  dedupTtlMs: env.DEDUP_TTL_SECS * 1000,
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
  upstreams,
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
      cooldownBaseSecs: env.NEARDATA_COOLDOWN_BASE_SECS,
      cooldownMaxSecs: env.NEARDATA_COOLDOWN_MAX_SECS,
      dedupTtlSecs: env.DEDUP_TTL_SECS,
      fastnearEnabled: config.fastnearEnabled,
      network: config.network,
      port: config.port,
      s3AccessKey: mask(config.s3AccessKey),
      s3Bucket: config.s3Bucket || '<unset>',
      s3EffectivelyEnabled: s3Ready,
      s3Enabled: config.s3Enabled,
      s3Endpoint: config.s3Endpoint || '<unset>',
      s3Region: config.s3Region,
      s3SecretKey: mask(config.s3SecretKey),
      upstreams: config.upstreams.map((upstream) => ({
        apiKey: mask(upstream.apiKey),
        name: upstream.name,
        url: upstream.url,
      })),
      upstreamTimeoutSecs: env.UPSTREAM_TIMEOUT_SECS,
    },
    'block-proxy config',
  );
}

export default config;
