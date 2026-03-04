export interface UpstreamError {
  error: string;
  notFound?: boolean;
  source: string;
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
  leaders: number;
  saves: number;
  total: number;
}

export interface UpstreamStats {
  fastnear: SourceStats;
  near_lake: SourceStats;
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
