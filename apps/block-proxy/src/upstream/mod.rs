pub mod fastnear;
pub mod near_lake;
pub mod s3;

pub use self::fastnear::FastnearUpstream;
pub use self::near_lake::NearLakeUpstream;
pub use self::s3::S3Upstream;

use std::sync::atomic::Ordering;
use std::time::Instant;

use bytes::Bytes;
use metrics::{counter, histogram};

use crate::error::UpstreamError;
use crate::state::AppState;

/// Record upstream request metrics (both Prometheus and StatsCollector).
fn record_upstream_ok(state: &AppState, source: &str, elapsed: std::time::Duration) {
    let duration_secs = elapsed.as_secs_f64();
    let duration_us = elapsed.as_micros() as u64;

    counter!("block_proxy_upstream_requests", "source" => source.to_string(), "result" => "ok").increment(1);
    histogram!("block_proxy_upstream_duration_seconds", "source" => source.to_string()).record(duration_secs);

    match source {
        "s3" => {
            state.stats.upstream_requests_s3.fetch_add(1, Ordering::Relaxed);
            state.stats.upstream_duration_us_s3.fetch_add(duration_us, Ordering::Relaxed);
        }
        "fastnear" => {
            state.stats.upstream_requests_fastnear.fetch_add(1, Ordering::Relaxed);
            state.stats.upstream_duration_us_fastnear.fetch_add(duration_us, Ordering::Relaxed);
        }
        "near_lake" => {
            state.stats.upstream_requests_near_lake.fetch_add(1, Ordering::Relaxed);
            state.stats.upstream_duration_us_near_lake.fetch_add(duration_us, Ordering::Relaxed);
        }
        _ => {}
    }
}

/// Record upstream error metrics.
fn record_upstream_err(state: &AppState, source: &str, elapsed: std::time::Duration) {
    let duration_secs = elapsed.as_secs_f64();
    let duration_us = elapsed.as_micros() as u64;

    counter!("block_proxy_upstream_requests", "source" => source.to_string(), "result" => "error").increment(1);
    histogram!("block_proxy_upstream_duration_seconds", "source" => source.to_string()).record(duration_secs);

    match source {
        "s3" => {
            state.stats.upstream_requests_s3.fetch_add(1, Ordering::Relaxed);
            state.stats.upstream_errors_s3.fetch_add(1, Ordering::Relaxed);
            state.stats.upstream_duration_us_s3.fetch_add(duration_us, Ordering::Relaxed);
        }
        "fastnear" => {
            state.stats.upstream_requests_fastnear.fetch_add(1, Ordering::Relaxed);
            state.stats.upstream_errors_fastnear.fetch_add(1, Ordering::Relaxed);
            state.stats.upstream_duration_us_fastnear.fetch_add(duration_us, Ordering::Relaxed);
        }
        "near_lake" => {
            state.stats.upstream_requests_near_lake.fetch_add(1, Ordering::Relaxed);
            state.stats.upstream_errors_near_lake.fetch_add(1, Ordering::Relaxed);
            state.stats.upstream_duration_us_near_lake.fetch_add(duration_us, Ordering::Relaxed);
        }
        _ => {}
    }
}

/// Fetch a block by height, trying enabled sources in priority order:
/// cache -> S3 -> fastnear -> NEAR Lake.
///
/// Returns `Ok((bytes, source_label))` on the first successful fetch, writing
/// the result to cache for all upstream hits.  Returns `Err(errors)` with
/// per-source failure details when all enabled sources are exhausted.
///
/// Every block request is logged with height, source, and latency (ms).
pub async fn fetch_block(
    state: &AppState,
    height: u64,
) -> Result<(Bytes, &'static str), Vec<UpstreamError>> {
    let mut errors: Vec<UpstreamError> = Vec::new();
    let start = Instant::now();

    // 1. Local filesystem cache (if enabled)
    if state.config.cache_enabled {
        match state.cache.read(height).await {
            Ok(Some(bytes)) => {
                counter!("block_proxy_cache_hits").increment(1);
                state.stats.cache_hits.fetch_add(1, Ordering::Relaxed);
                tracing::info!(
                    height,
                    source = "cache",
                    latency_ms = start.elapsed().as_millis(),
                    "block served"
                );
                return Ok((bytes, "cache"));
            }
            Ok(None) => {
                counter!("block_proxy_cache_misses").increment(1);
                state.stats.cache_misses.fetch_add(1, Ordering::Relaxed);
            }
            Err(e) => {
                counter!("block_proxy_cache_misses").increment(1);
                state.stats.cache_misses.fetch_add(1, Ordering::Relaxed);
                tracing::warn!(height, error = %e, "cache read error");
                errors.push(UpstreamError {
                    source: "cache".into(),
                    error: e.to_string(),
                });
            }
        }
    }

    // 2. S3/MinIO (if enabled and configured)
    if state.s3_enabled.load(Ordering::Relaxed) {
        if let Some(s3) = &state.s3 {
            let upstream_start = Instant::now();
            match s3.fetch(height).await {
                Ok(bytes) => {
                    record_upstream_ok(state, "s3", upstream_start.elapsed());
                    tracing::info!(
                        height,
                        source = "s3",
                        latency_ms = start.elapsed().as_millis(),
                        "block served"
                    );
                    if state.config.cache_enabled {
                        counter!("block_proxy_cache_writes").increment(1);
                        state.stats.cache_writes.fetch_add(1, Ordering::Relaxed);
                        state.cache.write_background(height, bytes.clone());
                    }
                    return Ok((bytes, "s3"));
                }
                Err(e) => {
                    record_upstream_err(state, "s3", upstream_start.elapsed());
                    tracing::warn!(height, source = "s3", error = %e, "upstream fetch failed");
                    errors.push(UpstreamError {
                        source: "s3".into(),
                        error: e.to_string(),
                    });
                }
            }
        }
    }

    // 3. fastnear (if enabled)
    if state.fastnear_enabled.load(Ordering::Relaxed) {
        let upstream_start = Instant::now();
        match state.fastnear.fetch(height).await {
            Ok(bytes) => {
                record_upstream_ok(state, "fastnear", upstream_start.elapsed());
                tracing::info!(
                    height,
                    source = "fastnear",
                    latency_ms = start.elapsed().as_millis(),
                    "block served"
                );
                if state.config.cache_enabled {
                    counter!("block_proxy_cache_writes").increment(1);
                    state.stats.cache_writes.fetch_add(1, Ordering::Relaxed);
                    state.cache.write_background(height, bytes.clone());
                }
                return Ok((bytes, "fastnear"));
            }
            Err(e) => {
                record_upstream_err(state, "fastnear", upstream_start.elapsed());
                tracing::warn!(height, source = "fastnear", error = %e, "upstream fetch failed");
                errors.push(UpstreamError {
                    source: "fastnear".into(),
                    error: e.to_string(),
                });
            }
        }
    }

    // 4. NEAR Lake (if enabled and configured)
    if state.near_lake_enabled.load(Ordering::Relaxed) {
        if let Some(near_lake) = &state.near_lake {
            let upstream_start = Instant::now();
            match near_lake.fetch(height).await {
                Ok(bytes) => {
                    record_upstream_ok(state, "near_lake", upstream_start.elapsed());
                    tracing::info!(
                        height,
                        source = "near_lake",
                        latency_ms = start.elapsed().as_millis(),
                        "block served"
                    );
                    if state.config.cache_enabled {
                        counter!("block_proxy_cache_writes").increment(1);
                        state.stats.cache_writes.fetch_add(1, Ordering::Relaxed);
                        state.cache.write_background(height, bytes.clone());
                    }
                    return Ok((bytes, "near_lake"));
                }
                Err(e) => {
                    record_upstream_err(state, "near_lake", upstream_start.elapsed());
                    tracing::warn!(
                        height,
                        source = "near_lake",
                        error = %e,
                        "upstream fetch failed"
                    );
                    errors.push(UpstreamError {
                        source: "near_lake".into(),
                        error: e.to_string(),
                    });
                }
            }
        }
    }

    // All sources exhausted.
    tracing::error!(height, errors = ?errors, "all upstream sources failed");
    Err(errors)
}

/// Fetch a block with singleflight deduplication.
///
/// Concurrent requests for the same `height` are collapsed: only one upstream
/// fetch is issued, and all waiters receive the same result.  The dedup group
/// key is prefixed with `"block:"` to avoid future namespace collisions.
///
/// Return value mirrors `fetch_block`: `Ok((bytes, source))` or
/// `Err(errors)`.  When the leader fails, waiting callers receive a
/// synthetic `UpstreamError` with source `"singleflight"` (the per-source
/// details are only available to the leader caller); the route handler
/// treats any non-Ok response as a 502.
pub async fn fetch_block_deduped(
    state: &AppState,
    height: u64,
) -> Result<(Bytes, &'static str), Vec<UpstreamError>> {
    let key = format!("block:{}", height);

    // Track dedup metrics.
    counter!("block_proxy_dedup_requests").increment(1);
    state.stats.dedup_total.fetch_add(1, Ordering::Relaxed);

    // Clone state into an owned value so we can move it into the async closure.
    let state_clone = state.clone();

    let result = state
        .dedup
        .work(&key, async move {
            // This closure runs only for the leader — track it.
            counter!("block_proxy_dedup_leaders").increment(1);
            state_clone.stats.dedup_leaders.fetch_add(1, Ordering::Relaxed);
            fetch_block(&state_clone, height).await
        })
        .await;

    match result {
        Ok(val) => Ok(val),
        // The leader returned an error — we have the actual Vec<UpstreamError>.
        Err(Some(errors)) => Err(errors),
        // A follower: the leader failed, error details not propagated.
        // Return a synthetic singleflight error; the 502 response will still be correct.
        Err(None) => Err(vec![UpstreamError {
            source: "singleflight".into(),
            error: "leader fetch failed; details logged by the leader request".into(),
        }]),
    }
}
