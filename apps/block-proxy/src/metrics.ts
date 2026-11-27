import client from 'prom-client';

export const register = new client.Registry();

export const cacheHits = new client.Counter({
  help: 'Total cache hit count',
  name: 'block_proxy_cache_hits',
  registers: [register],
});

export const cacheMisses = new client.Counter({
  help: 'Total cache miss count',
  name: 'block_proxy_cache_misses',
  registers: [register],
});

export const cacheWrites = new client.Counter({
  help: 'Total cache write count',
  name: 'block_proxy_cache_writes',
  registers: [register],
});

export const cacheEvictions = new client.Counter({
  help: 'Total cache eviction count',
  name: 'block_proxy_cache_evictions',
  registers: [register],
});

export const requests = new client.Counter({
  help: 'Total request count by endpoint',
  labelNames: ['endpoint'] as const,
  name: 'block_proxy_requests',
  registers: [register],
});

export const dedupRequests = new client.Counter({
  help: 'Total dedup request count',
  name: 'block_proxy_dedup_requests',
  registers: [register],
});

export const dedupLeaders = new client.Counter({
  help: 'Total dedup leader count',
  name: 'block_proxy_dedup_leaders',
  registers: [register],
});

export const dedupDeadlines = new client.Counter({
  help: 'Total dedup entries released by hitting their deadline',
  name: 'block_proxy_dedup_deadlines',
  registers: [register],
});

export const upstreamRequests = new client.Counter({
  help: 'Total upstream request count by source and result',
  labelNames: ['source', 'result'] as const,
  name: 'block_proxy_upstream_requests',
  registers: [register],
});

export const upstreamDuration = new client.Histogram({
  help: 'Upstream request duration in seconds',
  labelNames: ['source'] as const,
  name: 'block_proxy_upstream_duration_seconds',
  registers: [register],
});

export const upstreamRateLimited = new client.Counter({
  help: 'Total upstream rate-limited (HTTP 429) response count by source',
  labelNames: ['source'] as const,
  name: 'block_proxy_upstream_rate_limited',
  registers: [register],
});

export const tipHeight = new client.Gauge({
  help: 'Latest known chain tip height',
  name: 'block_proxy_tip_height',
  registers: [register],
});

export const indexerHead = new client.Gauge({
  help: 'Local node finalized head height',
  name: 'block_proxy_indexer_head_height',
  registers: [register],
});
export const indexerPublished = new client.Gauge({
  help: 'Last durably published local enriched block height',
  name: 'block_proxy_indexer_published_height',
  registers: [register],
});
export const indexerHeadAge = new client.Gauge({
  help: 'Local finalized head age at last poll in seconds',
  name: 'block_proxy_indexer_head_age_seconds',
  registers: [register],
});
export const indexerPending = new client.Gauge({
  help: 'In-memory receipt origin entries including short executed retention',
  name: 'block_proxy_indexer_receipt_entries',
  registers: [register],
});
export const indexerHealthy = new client.Gauge({
  help: 'Whether local ingestion last completed without error',
  name: 'block_proxy_indexer_healthy',
  registers: [register],
});
export const indexerErrors = new client.Counter({
  help: 'Local ingestion errors; HTTP fallback remains independent',
  name: 'block_proxy_indexer_errors_total',
  registers: [register],
});
export const indexerHeadTimestamp = new client.Gauge({
  help: 'Local finalized head timestamp; use time() minus this for age',
  name: 'block_proxy_indexer_head_timestamp_seconds',
  registers: [register],
});
export const indexerPublishedTimestamp = new client.Gauge({
  help: 'Local published block timestamp; use time() minus this for age',
  name: 'block_proxy_indexer_published_timestamp_seconds',
  registers: [register],
});
export const nodeInSync = new client.Gauge({
  help: 'Whether the local node is healthy and its finalized head is within the allowed lag (1) or not (0)',
  name: 'block_proxy_node_in_sync',
  registers: [register],
});

export const indexerReanchors = new client.Counter({
  help: 'Times the local indexer restarted at the node head, leaving earlier heights to remote sources',
  name: 'block_proxy_indexer_reanchors_total',
  registers: [register],
});

export const shadowComparisons = new client.Counter({
  help: 'Shadow block comparisons by result (match, mismatch, unavailable, error, skipped)',
  labelNames: ['result', 'source'] as const,
  name: 'block_proxy_shadow_comparisons_total',
  registers: [register],
});

export const shadowLastMismatchHeight = new client.Gauge({
  help: 'Highest block height whose shadow comparison found a difference',
  name: 'block_proxy_shadow_last_mismatch_height',
  registers: [register],
});

export const proxyNullOverridden = new client.Counter({
  help: 'Heights the upstream proxy reported as skipped (null) but a later source served as a block',
  name: 'block_proxy_proxy_null_overridden_total',
  registers: [register],
});

export const rpcRequests = new client.Counter({
  help: 'JSON-RPC requests by client, method and result (ok, upstream_error, timeout, out_of_sync, not_allowed, invalid)',
  labelNames: ['client', 'method', 'result'] as const,
  name: 'block_proxy_rpc_requests_total',
  registers: [register],
});

export const rpcDuration = new client.Histogram({
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  help: 'Time for the node to answer a forwarded JSON-RPC request',
  labelNames: ['method'] as const,
  name: 'block_proxy_rpc_duration_seconds',
  registers: [register],
});

export const blocksServed = new client.Counter({
  help: 'Blocks served by client and source (node, proxy, neardata, cache)',
  labelNames: ['client', 'source'] as const,
  name: 'block_proxy_blocks_served_total',
  registers: [register],
});
