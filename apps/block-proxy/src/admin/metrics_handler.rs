use axum::{
    extract::State,
    http::{HeaderValue, header},
    response::IntoResponse,
};

use crate::state::AppState;

/// GET /metrics — renders Prometheus text exposition format.
pub async fn metrics_handler(State(state): State<AppState>) -> impl IntoResponse {
    let body = state.metrics_handle.render();
    (
        [(header::CONTENT_TYPE, HeaderValue::from_static("text/plain; version=0.0.4; charset=utf-8"))],
        body,
    )
}
