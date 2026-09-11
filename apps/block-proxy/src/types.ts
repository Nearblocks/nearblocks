export interface UpstreamError {
  error: string;
  notFound?: boolean;
  rateLimited?: boolean;
  source: string;
}

/**
 * Error thrown by an upstream fetch. `status` lets the pool distinguish a
 * rate limit (cooldown) from a plain failure (try the next endpoint).
 */
export interface UpstreamFetchError extends Error {
  notFound?: boolean;
  retryAfterMs?: number;
  status?: number;
}

export interface HealthResponse {
  status: string;
  uptime_secs: number;
  version: string;
}

export interface ReadyzResponse {
  status: string;
}

export interface StatsSnapshot {
  cache: CacheStats;
  dedup: DedupStats;
  requests: RequestStats;
  tip_height: number;
  upstreams: UpstreamStats;
  uptime_secs: number;
}

export interface CacheStats {
  evictions: number;
  hit_rate: number;
  hits: number;
  misses: number;
  writes: number;
}

export interface DedupStats {
  deadlines: number;
  leaders: number;
  saves: number;
  total: number;
}

export type UpstreamStats = Record<string, SourceStats>;

export interface SourceStats {
  avg_latency_ms: number;
  enabled: boolean;
  errors: number;
  requests: number;
}

export interface RequestStats {
  block: number;
  last_block: number;
}
