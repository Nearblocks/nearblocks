mod metrics_handler;
mod stats;

use axum::{Router, routing::get};

use crate::state::AppState;

/// Build the admin router — served on a separate port from the data plane.
pub fn build_admin_router(state: AppState) -> Router {
    Router::new()
        .route("/metrics", get(metrics_handler::metrics_handler))
        .route("/stats", get(stats::stats_handler))
        .with_state(state)
}
