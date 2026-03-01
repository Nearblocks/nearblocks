use std::sync::atomic::Ordering;

use axum::{
    extract::State,
    http::{HeaderValue, StatusCode, header},
    response::{IntoResponse, Response},
};
use metrics::{counter, gauge};
use serde_json::json;

use crate::state::AppState;

/// GET /v0/last_block/final
///
/// Proxies the request to fastnear in real time — this response is NOT cached
/// (per ENDP-02) because the chain tip changes every ~1 second.
///
/// On success, updates `tip_height` AtomicU64 so the background eviction task
/// knows which blocks are "recent" and eligible for TTL eviction.
///
/// Returns the raw fastnear JSON with `X-Upstream-Source: fastnear` header.
pub async fn last_block_final_handler(State(state): State<AppState>) -> Response {
    counter!("block_proxy_requests", "endpoint" => "last_block").increment(1);
    state.stats.requests_last_block.fetch_add(1, Ordering::Relaxed);

    match state.fastnear.fetch_last_block_final().await {
        Ok(bytes) => {
            // Attempt to extract the block height from the JSON response to update
            // tip_height. fastnear's last_block/final response format contains
            // `block_height` at the top level (for the compact format) or nested
            // under `block.header.height` (for the full format). Try both.
            if let Ok(value) = serde_json::from_slice::<serde_json::Value>(&bytes) {
                let tip = value
                    .get("block_height")
                    .and_then(|v| v.as_u64())
                    .or_else(|| {
                        value
                            .get("block")
                            .and_then(|b| b.get("header"))
                            .and_then(|h| h.get("height"))
                            .and_then(|v| v.as_u64())
                    });

                if let Some(height) = tip {
                    state.tip_height.store(height, Ordering::Relaxed);
                    gauge!("block_proxy_tip_height").set(height as f64);
                    tracing::debug!(height, "tip_height updated from last_block/final");
                }
            }

            (
                StatusCode::OK,
                [
                    (header::CONTENT_TYPE, HeaderValue::from_static("application/json")),
                    (
                        header::HeaderName::from_static("x-upstream-source"),
                        HeaderValue::from_static("fastnear"),
                    ),
                ],
                bytes,
            )
                .into_response()
        }
        Err(e) => {
            tracing::error!(error = %e, "last_block/final fetch from fastnear failed");
            let body = json!({ "error": e.to_string() });
            (
                StatusCode::BAD_GATEWAY,
                [(header::CONTENT_TYPE, "application/json")],
                axum::Json(body),
            )
                .into_response()
        }
    }
}
