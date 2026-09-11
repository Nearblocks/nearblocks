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

/**
 * Cooldown is time-based, so it has to be read at scrape time rather than
 * written on transition — otherwise an endpoint whose cooldown expired during
 * a quiet period would still report as cooling.
 */
let cooldownProvider: (() => { cooling: boolean; name: string }[]) | null =
  null;

export const setCooldownProvider = (
  provider: () => { cooling: boolean; name: string }[],
): void => {
  cooldownProvider = provider;
};

export const upstreamCooldown = new client.Gauge({
  collect() {
    if (!cooldownProvider) return;

    for (const { cooling, name } of cooldownProvider()) {
      this.set({ source: name }, cooling ? 1 : 0);
    }
  },
  help: '1 while an upstream endpoint is in rate-limit cooldown, else 0',
  labelNames: ['source'] as const,
  name: 'block_proxy_upstream_cooldown',
  registers: [register],
});
