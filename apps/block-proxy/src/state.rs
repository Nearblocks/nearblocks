use std::sync::{
    Arc,
    atomic::{AtomicBool, AtomicU64, Ordering},
};
use std::time::Instant;

use async_singleflight::DefaultGroup;
use bytes::Bytes;
use metrics_exporter_prometheus::PrometheusHandle;

use crate::cache::CacheStore;
use crate::config::Config;
use crate::error::UpstreamError;
use crate::stats::StatsCollector;
use crate::upstream::{FastnearUpstream, NearLakeUpstream, S3Upstream};

/// Singleflight dedup group for block fetches.
///
/// Key type: `String` (e.g. `"block:42839521"`)
/// Success type: `(Bytes, &'static str)` — block data + source label
/// Error type: `Vec<UpstreamError>` — per-source failure details
pub type BlockDedupGroup = DefaultGroup<(Bytes, &'static str), Vec<UpstreamError>>;

#[derive(Clone)]
pub struct AppState {
    pub ready: Arc<AtomicBool>,
    pub start_time: Instant,
    pub version: &'static str,
    /// Shared, immutable configuration for the lifetime of the process.
    pub config: Arc<Config>,
    /// Filesystem cache for block JSON data (zstd-compressed, sharded by height).
    pub cache: Arc<CacheStore>,
    /// Latest known chain tip height, updated by the last-block handler (Plan 04).
    /// Used by the background eviction task to determine which blocks are "recent".
    pub tip_height: Arc<AtomicU64>,
    /// fastnear upstream — always present; used for block fetches and last_block/final.
    pub fastnear: Arc<FastnearUpstream>,
    /// S3/MinIO upstream — None if endpoint or bucket not configured.
    pub s3: Option<Arc<S3Upstream>>,
    /// NEAR Lake upstream — None if near_lake_enabled is false (avoids loading AWS creds).
    pub near_lake: Option<Arc<NearLakeUpstream>>,
    /// Singleflight dedup group — ensures concurrent requests for the same block height
    /// produce exactly one upstream fetch.
    pub dedup: Arc<BlockDedupGroup>,
    /// Prometheus metrics handle — used to render `/metrics` on the admin server.
    pub metrics_handle: PrometheusHandle,
    /// Runtime toggle for S3 upstream (initialized from config, flippable via admin API).
    pub s3_enabled: Arc<AtomicBool>,
    /// Runtime toggle for fastnear upstream.
    pub fastnear_enabled: Arc<AtomicBool>,
    /// Runtime toggle for NEAR Lake upstream.
    pub near_lake_enabled: Arc<AtomicBool>,
    /// Atomic counters for the JSON `/stats` endpoint.
    pub stats: Arc<StatsCollector>,
}

impl AppState {
    /// Creates the application state, initializing all upstream clients.
    ///
    /// This is async because `NearLakeUpstream::new()` is async (aws_config::load_defaults
    /// is async). Call with `.await` inside `#[tokio::main]`.
    pub async fn new(config: Config, metrics_handle: PrometheusHandle) -> Self {
        let cache = Arc::new(CacheStore::new(&config));

        // fastnear is always created — it is the primary upstream and the last_block proxy.
        let fastnear = Arc::new(FastnearUpstream::new(&config));

        // S3 returns None if endpoint/bucket not configured.
        let s3 = S3Upstream::new(&config).map(Arc::new);

        // NEAR Lake is only constructed if enabled (avoids unnecessary AWS config loading).
        let near_lake = if config.near_lake_enabled {
            Some(Arc::new(NearLakeUpstream::new(&config).await))
        } else {
            None
        };

        let dedup = Arc::new(BlockDedupGroup::new());

        // Initialize runtime upstream toggles from config values.
        let s3_enabled = Arc::new(AtomicBool::new(config.s3_enabled));
        let fastnear_enabled = Arc::new(AtomicBool::new(config.fastnear_enabled));
        let near_lake_enabled = Arc::new(AtomicBool::new(config.near_lake_enabled));

        Self {
            ready: Arc::new(AtomicBool::new(false)),
            start_time: Instant::now(),
            version: env!("CARGO_PKG_VERSION"),
            config: Arc::new(config),
            cache,
            tip_height: Arc::new(AtomicU64::new(0)),
            fastnear,
            s3,
            near_lake,
            dedup,
            metrics_handle,
            s3_enabled,
            fastnear_enabled,
            near_lake_enabled,
            stats: Arc::new(StatsCollector::new()),
        }
    }

    pub fn set_ready(&self) {
        self.ready.store(true, Ordering::SeqCst);
    }

    pub fn is_ready(&self) -> bool {
        self.ready.load(Ordering::SeqCst)
    }
}
