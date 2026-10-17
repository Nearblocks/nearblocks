import { bool, cleanEnv, num, port, str } from 'envalid';

import { logger } from 'nb-logger';

// Read-only methods used by the explorer API and backend. Transaction
// submission and the heavier EXPERIMENTAL_* calls stay closed unless listed.
const DEFAULT_RPC_ALLOWED_METHODS = [
  'EXPERIMENTAL_changes',
  'EXPERIMENTAL_changes_in_block',
  'EXPERIMENTAL_genesis_config',
  'EXPERIMENTAL_light_client_proof',
  'EXPERIMENTAL_protocol_config',
  'EXPERIMENTAL_receipt',
  'EXPERIMENTAL_tx_status',
  'EXPERIMENTAL_validators_ordered',
  'block',
  'chunk',
  'gas_price',
  'light_client_proof',
  'query',
  'status',
  'tx',
  'validators',
].join(',');

// Renamed from FASTNEAR_*. Existing deployments keep working (a new name,
// when set, wins) instead of the old settings being silently ignored.
const LEGACY_ENV = [
  ['FASTNEAR_API_KEY', 'NEARDATA_UPSTREAM_API_KEY'],
  ['FASTNEAR_ENABLED', 'NEARDATA_ENABLED'],
  ['FASTNEAR_URL', 'NEARDATA_URL'],
] as const;
const legacyEnvUsed: string[] = [];
for (const [legacy, current] of LEGACY_ENV) {
  if (process.env[legacy] !== undefined && process.env[current] === undefined) {
    process.env[current] = process.env[legacy];
    legacyEnvUsed.push(legacy);
  }
}

const env = cleanEnv(process.env, {
  ADMIN_LISTEN_HOST: str({ default: '127.0.0.1' }),
  ADMIN_PORT: port({ default: 3001 }),
  BLOCK_PROXY_UPSTREAM_API_KEY: str({ default: '' }),
  BLOCK_PROXY_UPSTREAM_URL: str({ default: '' }),
  BLOCK_SOURCES: str({ default: '' }),
  CACHE_COMPRESSION: bool({ default: false }),
  CACHE_DIR: str({ default: '/app/cache' }),
  CACHE_ENABLED: bool({ default: true }),
  CACHE_MIN_FREE_BYTES: num({ default: 0 }),
  CACHE_TTL_SECS: num({ default: 3600 }),
  DEDUP_TTL_SECS: num({ default: 25 }),
  EXIT_ON_WORKER_FAILURE: bool({ default: true }),
  INDEXER_INTERVAL_MS: num({ default: 250 }),
  INDEXER_STATE_DIR: str({ default: '/app/state' }),
  LISTEN_HOST: str({ default: '127.0.0.1' }),
  LOG_LEVEL: str({ default: 'info' }),
  NEARDATA_ENABLED: bool({ default: true }),
  NEARDATA_UPSTREAM_API_KEY: str({ default: '' }),
  NEARDATA_URL: str({ default: '' }),
  NETWORK: str({ choices: ['mainnet', 'testnet'], default: 'mainnet' }),
  NODE_INDEXER_ENABLED: bool({ default: false }),
  // How far the node's finalized head may trail wall-clock time before the
  // node source is treated as out of sync.
  NODE_MAX_LAG_SECS: num({ default: 10 }),
  NODE_RPC_URL: str({ default: 'http://127.0.0.1:3030' }),
  PORT: port({ default: 3000 }),
  PROXY_API_KEY: str({ default: '' }),
  RPC_ALLOWED_METHODS: str({ default: DEFAULT_RPC_ALLOWED_METHODS }),
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

function deriveNeardataUrl(network: string, override_: string): string {
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

const s3Configured =
  !!env.S3_ENDPOINT &&
  !!env.S3_BUCKET &&
  !!env.S3_ACCESS_KEY &&
  !!env.S3_SECRET_KEY;

const validSources = new Set(['node', 'neardata', 'proxy', 's3']);
const legacySources = [
  ...(env.NODE_INDEXER_ENABLED ? ['node'] : []),
  ...(env.S3_ENABLED && s3Configured ? ['s3'] : []),
  ...(env.NEARDATA_ENABLED ? ['neardata'] : []),
];
const blockSources = env.BLOCK_SOURCES
  ? env.BLOCK_SOURCES.split(',').map((source) => source.trim().toLowerCase())
  : legacySources;
if (
  blockSources.length === 0 ||
  blockSources.some((source) => !validSources.has(source)) ||
  new Set(blockSources).size !== blockSources.length
) {
  throw new Error(
    'BLOCK_SOURCES must be a comma-separated list of node, neardata, and/or s3.',
  );
}
if (blockSources.includes('s3') && !s3Configured) {
  throw new Error('BLOCK_SOURCES includes s3 but S3 settings are incomplete.');
}
if (
  blockSources.includes('proxy') &&
  (!env.BLOCK_PROXY_UPSTREAM_URL || !URL.canParse(env.BLOCK_PROXY_UPSTREAM_URL))
) {
  throw new Error(
    'BLOCK_SOURCES includes proxy but BLOCK_PROXY_UPSTREAM_URL is missing or invalid.',
  );
}
if (
  !blockSources.some(
    (source) =>
      source === 'node' || source === 'neardata' || source === 'proxy',
  )
) {
  throw new Error(
    'BLOCK_SOURCES must include node, proxy, or neardata for finalized-head requests.',
  );
}
if (
  !Number.isSafeInteger(env.CACHE_MIN_FREE_BYTES) ||
  env.CACHE_MIN_FREE_BYTES < 0
) {
  throw new Error('CACHE_MIN_FREE_BYTES must be a non-negative safe integer.');
}
if (
  !['::1', '127.0.0.1', 'localhost'].includes(env.LISTEN_HOST) &&
  !env.PROXY_API_KEY
) {
  throw new Error(
    'PROXY_API_KEY is required when LISTEN_HOST is not loopback.',
  );
}
if (!['::1', '127.0.0.1', 'localhost'].includes(env.ADMIN_LISTEN_HOST)) {
  throw new Error(
    'ADMIN_LISTEN_HOST must be loopback; admin routes have no auth.',
  );
}

if (env.UPSTREAM_TIMEOUT_SECS < 1) {
  throw new Error(
    `UPSTREAM_TIMEOUT_SECS=${env.UPSTREAM_TIMEOUT_SECS} must be at least 1: ` +
      'at zero every upstream fetch aborts instantly.',
  );
}

if (
  !Number.isSafeInteger(env.INDEXER_INTERVAL_MS) ||
  env.INDEXER_INTERVAL_MS < 50
) {
  throw new Error('INDEXER_INTERVAL_MS must be at least 50.');
}

if (!Number.isSafeInteger(env.NODE_MAX_LAG_SECS) || env.NODE_MAX_LAG_SECS < 5) {
  throw new Error('NODE_MAX_LAG_SECS must be an integer of at least 5.');
}

if (env.DEDUP_TTL_SECS < 5 || env.DEDUP_TTL_SECS > 60) {
  throw new Error(`DEDUP_TTL_SECS=${env.DEDUP_TTL_SECS} must be 5-60.`);
}

// The dedup deadline must outlast one upstream attempt, or slow but healthy
// fetches end in spurious "dedup deadline exceeded" errors.
if (env.DEDUP_TTL_SECS <= env.UPSTREAM_TIMEOUT_SECS) {
  throw new Error(
    `DEDUP_TTL_SECS=${env.DEDUP_TTL_SECS} must exceed UPSTREAM_TIMEOUT_SECS=${env.UPSTREAM_TIMEOUT_SECS}.`,
  );
}

if (env.CACHE_COMPRESSION) {
  throw new Error(
    'CACHE_COMPRESSION=true is not yet supported in the TypeScript port. ' +
      'Set CACHE_COMPRESSION=false or remove it to use uncompressed caching.',
  );
}

if (blockSources.includes('node') && !env.CACHE_ENABLED) {
  throw new Error('local indexer requires persistent disk caching');
}

const rpcAllowedMethods = env.RPC_ALLOWED_METHODS.split(',')
  .map((method) => method.trim())
  .filter(Boolean);
if (rpcAllowedMethods.length === 0) {
  throw new Error('RPC_ALLOWED_METHODS must list at least one method.');
}

const config = {
  adminListenHost: env.ADMIN_LISTEN_HOST,
  adminPort: env.ADMIN_PORT,
  blockSources,
  cacheCompression: env.CACHE_COMPRESSION,
  cacheDir: env.CACHE_DIR,
  cacheEnabled: env.CACHE_ENABLED,
  cacheMinFreeBytes: env.CACHE_MIN_FREE_BYTES,
  cacheTtlSecs: env.CACHE_TTL_SECS,
  dedupTtlMs: env.DEDUP_TTL_SECS * 1000,
  exitOnWorkerFailure: env.EXIT_ON_WORKER_FAILURE,
  indexerIntervalMs: env.INDEXER_INTERVAL_MS,
  indexerMaxCatchupBlocks: 10_000,
  indexerMaxHeadAgeSecs: 10,
  indexerMaxPendingReceipts: 1_000_000,
  indexerReplayBlocks: 250,
  indexerStateDir: env.INDEXER_STATE_DIR,
  indexerWaitMs: 1000,
  indexerWorkerMemoryMb: 1024,
  listenHost: env.LISTEN_HOST,
  logLevel: env.LOG_LEVEL,
  neardataApiKey: env.NEARDATA_UPSTREAM_API_KEY,
  neardataBaseUrl: deriveNeardataUrl(env.NETWORK, env.NEARDATA_URL),
  neardataEnabled: blockSources.includes('neardata'),
  network: env.NETWORK,
  nodeIndexerEnabled: blockSources.includes('node'),
  nodeMaxLagSecs: env.NODE_MAX_LAG_SECS,
  nodeRpcUrl: env.NODE_RPC_URL,
  port: env.PORT,
  proxyApiKey: env.PROXY_API_KEY,
  proxyUpstreamApiKey: env.BLOCK_PROXY_UPSTREAM_API_KEY,
  proxyUpstreamBaseUrl: env.BLOCK_PROXY_UPSTREAM_URL,
  rpcAllowedMethods,
  s3AccessKey: env.S3_ACCESS_KEY,
  s3Bucket: env.S3_BUCKET,
  s3Enabled: blockSources.includes('s3'),
  s3Endpoint: env.S3_ENDPOINT,
  s3Region: env.S3_REGION,
  s3SecretKey: env.S3_SECRET_KEY,
  upstreamTimeoutMs: env.UPSTREAM_TIMEOUT_SECS * 1000,
};

export type Config = typeof config;

export function logConfigSummary(): void {
  if (legacyEnvUsed.length)
    logger.warn(
      { legacy: legacyEnvUsed },
      'FASTNEAR_* settings are deprecated; use the NEARDATA_* names',
    );
  logger.info(
    {
      adminListenHost: config.adminListenHost,
      adminPort: config.adminPort,
      blockSources: config.blockSources,
      cacheCompression: config.cacheCompression,
      cacheDir: config.cacheDir,
      cacheEnabled: config.cacheEnabled,
      cacheTtlSecs: config.cacheTtlSecs,
      dedupTtlSecs: env.DEDUP_TTL_SECS,
      indexerIntervalMs: config.indexerIntervalMs,
      indexerReplayBlocks: config.indexerReplayBlocks,
      indexerStateDir: config.indexerStateDir,
      listenHost: config.listenHost,
      neardataApiKey: mask(config.neardataApiKey),
      neardataEnabled: config.neardataEnabled,
      neardataUrl: config.neardataBaseUrl,
      network: config.network,
      nodeIndexerEnabled: config.nodeIndexerEnabled,
      nodeMaxLagSecs: config.nodeMaxLagSecs,
      port: config.port,
      proxyUpstreamApiKey: mask(config.proxyUpstreamApiKey),
      proxyUpstreamUrl: config.proxyUpstreamBaseUrl || '<unset>',
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
      upstreamTimeoutSecs: env.UPSTREAM_TIMEOUT_SECS,
    },
    'block-proxy config',
  );
}

export default config;
