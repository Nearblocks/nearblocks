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

const DEFAULT_DEDUP_TTL_SECS = 25;
const DEDUP_SLACK_SECS = 5;
const MAX_DEDUP_TTL_SECS = 60;

// Renamed settings. The old name still works alone; both set to different
// values is refused rather than one silently winning.
const RENAMED_ENV = [
  ['FASTNEAR_API_KEY', 'NEARDATA_UPSTREAM_API_KEY'],
  ['FASTNEAR_URL', 'NEARDATA_URL'],
] as const;
const legacyEnvUsed: string[] = [];
for (const [legacy, current] of RENAMED_ENV) {
  const old = process.env[legacy];
  if (old === undefined) continue;
  if (process.env[current] !== undefined && process.env[current] !== old)
    throw new Error(`${legacy} and ${current} disagree; keep only ${current}.`);
  process.env[current] = old;
  legacyEnvUsed.push(legacy);
}

// Settings from older releases, now covered by BLOCK_SOURCES or derived. One
// that would still change what is served is refused with the fix; the rest
// are ignored with a warning. Nothing is dropped silently.
const RETIRED_ENV: Array<{
  name: string;
  refuse?: (value: string) => boolean;
  use: string;
}> = [
  {
    name: 'FASTNEAR_ENABLED',
    refuse: (value) => value === 'false',
    use: 'BLOCK_SOURCES',
  },
  {
    name: 'NEARDATA_ENABLED',
    refuse: (value) => value === 'false',
    use: 'BLOCK_SOURCES',
  },
  {
    name: 'NODE_INDEXER_ENABLED',
    refuse: (value) => value === 'true',
    use: 'BLOCK_SOURCES=node',
  },
  {
    name: 'CACHE_COMPRESSION',
    refuse: (value) => value === 'true',
    use: 'uncompressed caching',
  },
  { name: 'DEDUP_TTL_SECS', use: 'the derived deadline' },
  // The S3 block store is retired; neardata serves those blocks.
  ...[
    'S3_ACCESS_KEY',
    'S3_BUCKET',
    'S3_ENABLED',
    'S3_ENDPOINT',
    'S3_REGION',
    'S3_SECRET_KEY',
  ].map((name) => ({ name, use: 'neardata' })),
];
const retiredEnvIgnored: string[] = [];
for (const { name, refuse, use } of RETIRED_ENV) {
  const value = process.env[name];
  if (value === undefined) continue;
  if (refuse?.(value.trim().toLowerCase()))
    throw new Error(`${name}=${value} is no longer supported; use ${use}.`);
  retiredEnvIgnored.push(name);
}

const env = cleanEnv(process.env, {
  ADMIN_LISTEN_HOST: str({ default: '0.0.0.0' }),
  ADMIN_PORT: port({ default: 3001 }),
  BLOCK_PROXY_UPSTREAM_API_KEY: str({ default: '' }),
  BLOCK_PROXY_UPSTREAM_URL: str({ default: '' }),
  // Where blocks come from, in priority order.
  BLOCK_SOURCES: str({ default: 'neardata' }),
  CACHE_DIR: str({ default: '/app/cache' }),
  CACHE_ENABLED: bool({ default: true }),
  CACHE_MIN_FREE_BYTES: num({ default: 0 }),
  CACHE_TTL_SECS: num({ default: 3600 }),
  EXIT_ON_WORKER_FAILURE: bool({ default: true }),
  INDEXER_INTERVAL_MS: num({ default: 250 }),
  INDEXER_STATE_DIR: str({ default: '/app/state' }),
  LISTEN_HOST: str({ default: '0.0.0.0' }),
  LOG_LEVEL: str({ default: 'info' }),
  NEARDATA_UPSTREAM_API_KEY: str({ default: '' }),
  NEARDATA_URL: str({ default: '' }),
  NETWORK: str({ choices: ['mainnet', 'testnet'], default: 'mainnet' }),
  // How far the node's finalized head may trail wall-clock time before the
  // node source is treated as out of sync.
  NODE_MAX_LAG_SECS: num({ default: 10 }),
  // Sent as a Bearer token to NODE_RPC_URL, e.g. another block-proxy's /rpc.
  NODE_RPC_API_KEY: str({ default: '' }),
  NODE_RPC_URL: str({ default: 'http://127.0.0.1:3030' }),
  PORT: port({ default: 3000 }),
  PROXY_API_KEY: str({ default: '' }),
  RPC_ALLOWED_METHODS: str({ default: DEFAULT_RPC_ALLOWED_METHODS }),
  // Compare served blocks with this source in the background (see README).
  SHADOW_SAMPLE_RATE: num({ default: 0.1 }),
  SHADOW_SOURCE: str({ choices: ['', 'neardata', 'proxy'], default: '' }),
  // One timeout for every upstream, kept below the client abort. When equal,
  // indexers gave up before the proxy could answer.
  UPSTREAM_TIMEOUT_SECS: num({ default: 13 }),
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

const validSources = new Set(['node', 'neardata', 'proxy']);
const blockSources = env.BLOCK_SOURCES.split(',').map((source) =>
  source.trim().toLowerCase(),
);
if (
  blockSources.some((source) => !validSources.has(source)) ||
  new Set(blockSources).size !== blockSources.length
) {
  throw new Error(
    'BLOCK_SOURCES must be a comma-separated list of node, proxy and/or neardata.',
  );
}
if (
  (blockSources.includes('proxy') || env.SHADOW_SOURCE === 'proxy') &&
  (!env.BLOCK_PROXY_UPSTREAM_URL || !URL.canParse(env.BLOCK_PROXY_UPSTREAM_URL))
) {
  throw new Error(
    'BLOCK_SOURCES or SHADOW_SOURCE uses proxy but BLOCK_PROXY_UPSTREAM_URL is missing or invalid.',
  );
}
// Blocks served by the shadow source itself are never compared.
if (env.SHADOW_SOURCE && env.SHADOW_SOURCE === blockSources[0]) {
  throw new Error(
    `SHADOW_SOURCE=${env.SHADOW_SOURCE} is also the first block source, so nothing would be compared.`,
  );
}
if (!(env.SHADOW_SAMPLE_RATE > 0 && env.SHADOW_SAMPLE_RATE <= 1)) {
  throw new Error('SHADOW_SAMPLE_RATE must be greater than 0 and at most 1.');
}
if (
  !Number.isSafeInteger(env.CACHE_MIN_FREE_BYTES) ||
  env.CACHE_MIN_FREE_BYTES < 0
) {
  throw new Error('CACHE_MIN_FREE_BYTES must be a non-negative safe integer.');
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

// The dedup deadline covers one timeout per remote source tried in turn plus
// slack, so a hung source still leaves time for the next one.
const remoteSourceCount = blockSources.filter(
  (source) => source !== 'node',
).length;
const dedupTtlSecs = Math.min(
  MAX_DEDUP_TTL_SECS,
  Math.max(
    DEFAULT_DEDUP_TTL_SECS,
    env.UPSTREAM_TIMEOUT_SECS * remoteSourceCount + DEDUP_SLACK_SECS,
  ),
);

// The dedup deadline must outlast one upstream attempt, or slow but healthy
// fetches end in spurious "dedup deadline exceeded" errors.
if (dedupTtlSecs <= env.UPSTREAM_TIMEOUT_SECS) {
  throw new Error(
    `UPSTREAM_TIMEOUT_SECS=${env.UPSTREAM_TIMEOUT_SECS} must be below ${MAX_DEDUP_TTL_SECS}.`,
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
  cacheDir: env.CACHE_DIR,
  cacheEnabled: env.CACHE_ENABLED,
  cacheMinFreeBytes: env.CACHE_MIN_FREE_BYTES,
  cacheTtlSecs: env.CACHE_TTL_SECS,
  dedupTtlMs: dedupTtlSecs * 1000,
  exitOnWorkerFailure: env.EXIT_ON_WORKER_FAILURE,
  // A failed poll only marks the node down once failures last this long.
  indexerErrorGraceMs: 5000,
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
  network: env.NETWORK,
  nodeIndexerEnabled: blockSources.includes('node'),
  nodeMaxLagSecs: env.NODE_MAX_LAG_SECS,
  nodeRpcApiKey: env.NODE_RPC_API_KEY,
  nodeRpcUrl: env.NODE_RPC_URL,
  port: env.PORT,
  proxyApiKey: env.PROXY_API_KEY,
  proxyUpstreamApiKey: env.BLOCK_PROXY_UPSTREAM_API_KEY,
  proxyUpstreamBaseUrl: env.BLOCK_PROXY_UPSTREAM_URL,
  rpcAllowedMethods,
  shadowSampleRate: env.SHADOW_SAMPLE_RATE,
  shadowSource: (env.SHADOW_SOURCE || null) as 'neardata' | 'proxy' | null,
  upstreamTimeoutMs: env.UPSTREAM_TIMEOUT_SECS * 1000,
};

export type Config = typeof config;

export function logConfigSummary(): void {
  if (legacyEnvUsed.length)
    logger.warn(
      { legacy: legacyEnvUsed },
      'FASTNEAR_* settings are deprecated; use the NEARDATA_* names',
    );
  if (retiredEnvIgnored.length)
    logger.warn(
      { ignored: retiredEnvIgnored },
      'retired settings are ignored; see BLOCK_SOURCES in the README',
    );
  logger.info(
    {
      adminListenHost: config.adminListenHost,
      adminPort: config.adminPort,
      blockSources: config.blockSources,
      cacheDir: config.cacheDir,
      cacheEnabled: config.cacheEnabled,
      cacheTtlSecs: config.cacheTtlSecs,
      dedupTtlSecs,
      indexerIntervalMs: config.indexerIntervalMs,
      indexerReplayBlocks: config.indexerReplayBlocks,
      indexerStateDir: config.indexerStateDir,
      listenHost: config.listenHost,
      neardataApiKey: mask(config.neardataApiKey),
      neardataUrl: config.neardataBaseUrl,
      network: config.network,
      nodeIndexerEnabled: config.nodeIndexerEnabled,
      nodeMaxLagSecs: config.nodeMaxLagSecs,
      port: config.port,
      proxyUpstreamApiKey: mask(config.proxyUpstreamApiKey),
      proxyUpstreamUrl: config.proxyUpstreamBaseUrl || '<unset>',
      shadowSampleRate: config.shadowSampleRate,
      shadowSource: config.shadowSource ?? '<unset>',
      upstreamTimeoutSecs: env.UPSTREAM_TIMEOUT_SECS,
    },
    'block-proxy config',
  );
}

export default config;
