use std::sync::atomic::{AtomicU64, Ordering};

use serde::Serialize;

/// Lightweight atomic counters that mirror Prometheus metrics but can be
/// read as a batch for the JSON `/stats` endpoint.
pub struct StatsCollector {
    pub cache_hits: AtomicU64,
    pub cache_misses: AtomicU64,
    pub cache_writes: AtomicU64,
    pub cache_evictions: AtomicU64,
    pub upstream_requests_s3: AtomicU64,
    pub upstream_requests_fastnear: AtomicU64,
    pub upstream_requests_near_lake: AtomicU64,
    pub upstream_errors_s3: AtomicU64,
    pub upstream_errors_fastnear: AtomicU64,
    pub upstream_errors_near_lake: AtomicU64,
    /// Cumulative upstream latency in microseconds — divide by request count
    /// to get average latency per source.
    pub upstream_duration_us_s3: AtomicU64,
    pub upstream_duration_us_fastnear: AtomicU64,
    pub upstream_duration_us_near_lake: AtomicU64,
    pub dedup_total: AtomicU64,
    pub dedup_leaders: AtomicU64,
    pub requests_block: AtomicU64,
    pub requests_last_block: AtomicU64,
}

impl StatsCollector {
    pub fn new() -> Self {
        Self {
            cache_hits: AtomicU64::new(0),
            cache_misses: AtomicU64::new(0),
            cache_writes: AtomicU64::new(0),
            cache_evictions: AtomicU64::new(0),
            upstream_requests_s3: AtomicU64::new(0),
            upstream_requests_fastnear: AtomicU64::new(0),
            upstream_requests_near_lake: AtomicU64::new(0),
            upstream_errors_s3: AtomicU64::new(0),
            upstream_errors_fastnear: AtomicU64::new(0),
            upstream_errors_near_lake: AtomicU64::new(0),
            upstream_duration_us_s3: AtomicU64::new(0),
            upstream_duration_us_fastnear: AtomicU64::new(0),
            upstream_duration_us_near_lake: AtomicU64::new(0),
            dedup_total: AtomicU64::new(0),
            dedup_leaders: AtomicU64::new(0),
            requests_block: AtomicU64::new(0),
            requests_last_block: AtomicU64::new(0),
        }
    }

    /// Produce a JSON-serialisable snapshot of all counters with derived values.
    ///
    /// `upstream_enabled` contains the runtime enabled/disabled state for each source.
    pub fn snapshot(
        &self,
        tip_height: u64,
        uptime_secs: u64,
        upstream_enabled: UpstreamEnabled,
    ) -> StatsSnapshot {
        let cache_hits = self.cache_hits.load(Ordering::Relaxed);
        let cache_misses = self.cache_misses.load(Ordering::Relaxed);
        let cache_total = cache_hits + cache_misses;
        let cache_hit_rate = if cache_total > 0 {
            cache_hits as f64 / cache_total as f64
        } else {
            0.0
        };

        let dedup_total = self.dedup_total.load(Ordering::Relaxed);
        let dedup_leaders = self.dedup_leaders.load(Ordering::Relaxed);
        let dedup_saves = dedup_total.saturating_sub(dedup_leaders);

        let s3_reqs = self.upstream_requests_s3.load(Ordering::Relaxed);
        let fastnear_reqs = self.upstream_requests_fastnear.load(Ordering::Relaxed);
        let near_lake_reqs = self.upstream_requests_near_lake.load(Ordering::Relaxed);

        fn avg_latency_ms(duration_us: u64, count: u64) -> f64 {
            if count > 0 {
                (duration_us as f64 / count as f64) / 1000.0
            } else {
                0.0
            }
        }

        StatsSnapshot {
            uptime_secs,
            tip_height,
            cache: CacheStats {
                hits: cache_hits,
                misses: cache_misses,
                hit_rate: cache_hit_rate,
                writes: self.cache_writes.load(Ordering::Relaxed),
                evictions: self.cache_evictions.load(Ordering::Relaxed),
            },
            dedup: DedupStats {
                total: dedup_total,
                leaders: dedup_leaders,
                saves: dedup_saves,
            },
            upstreams: UpstreamStats {
                s3: SourceStats {
                    enabled: upstream_enabled.s3,
                    requests: s3_reqs,
                    errors: self.upstream_errors_s3.load(Ordering::Relaxed),
                    avg_latency_ms: avg_latency_ms(
                        self.upstream_duration_us_s3.load(Ordering::Relaxed),
                        s3_reqs,
                    ),
                },
                fastnear: SourceStats {
                    enabled: upstream_enabled.fastnear,
                    requests: fastnear_reqs,
                    errors: self.upstream_errors_fastnear.load(Ordering::Relaxed),
                    avg_latency_ms: avg_latency_ms(
                        self.upstream_duration_us_fastnear.load(Ordering::Relaxed),
                        fastnear_reqs,
                    ),
                },
                near_lake: SourceStats {
                    enabled: upstream_enabled.near_lake,
                    requests: near_lake_reqs,
                    errors: self.upstream_errors_near_lake.load(Ordering::Relaxed),
                    avg_latency_ms: avg_latency_ms(
                        self.upstream_duration_us_near_lake.load(Ordering::Relaxed),
                        near_lake_reqs,
                    ),
                },
            },
            requests: RequestStats {
                block: self.requests_block.load(Ordering::Relaxed),
                last_block: self.requests_last_block.load(Ordering::Relaxed),
            },
        }
    }
}

#[derive(Serialize)]
pub struct StatsSnapshot {
    pub uptime_secs: u64,
    pub tip_height: u64,
    pub cache: CacheStats,
    pub dedup: DedupStats,
    pub upstreams: UpstreamStats,
    pub requests: RequestStats,
}

#[derive(Serialize)]
pub struct CacheStats {
    pub hits: u64,
    pub misses: u64,
    pub hit_rate: f64,
    pub writes: u64,
    pub evictions: u64,
}

#[derive(Serialize)]
pub struct DedupStats {
    pub total: u64,
    pub leaders: u64,
    pub saves: u64,
}

#[derive(Serialize)]
pub struct UpstreamStats {
    pub s3: SourceStats,
    pub fastnear: SourceStats,
    pub near_lake: SourceStats,
}

#[derive(Serialize)]
pub struct SourceStats {
    pub enabled: bool,
    pub requests: u64,
    pub errors: u64,
    pub avg_latency_ms: f64,
}

#[derive(Serialize)]
pub struct RequestStats {
    pub block: u64,
    pub last_block: u64,
}

/// Current runtime enabled/disabled state for each upstream source.
pub struct UpstreamEnabled {
    pub s3: bool,
    pub fastnear: bool,
    pub near_lake: bool,
}
