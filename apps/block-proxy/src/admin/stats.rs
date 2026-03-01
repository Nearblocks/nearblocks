use std::sync::atomic::Ordering;

use axum::{extract::State, response::IntoResponse, Json};

use crate::state::AppState;
use crate::stats::UpstreamEnabled;

/// GET /stats — returns a JSON snapshot of all counters with derived values.
pub async fn stats_handler(State(state): State<AppState>) -> impl IntoResponse {
    let tip_height = state.tip_height.load(Ordering::Relaxed);
    let uptime_secs = state.start_time.elapsed().as_secs();
    let upstream_enabled = UpstreamEnabled {
        s3: state.s3_enabled.load(Ordering::Relaxed),
        fastnear: state.fastnear_enabled.load(Ordering::Relaxed),
        near_lake: state.near_lake_enabled.load(Ordering::Relaxed),
    };
    let snapshot = state.stats.snapshot(tip_height, uptime_secs, upstream_enabled);
    Json(snapshot)
}
