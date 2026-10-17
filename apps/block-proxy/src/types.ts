export interface UpstreamError {
  body?: string;
  contentType?: string;
  error: string;
  notFound?: boolean;
  pending?: boolean;
  retryAfter?: string;
  source: string;
  status?: number;
}

export class UpstreamRedirectError extends Error {
  constructor(
    readonly location: string,
    readonly status = 302,
  ) {
    super(`upstream redirect to ${location}`);
    this.name = 'UpstreamRedirectError';
  }
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

export interface UpstreamStats {
  neardata: SourceStats;
  proxy: SourceStats;
  s3: SourceStats;
}

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
