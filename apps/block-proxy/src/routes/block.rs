use std::sync::atomic::Ordering;

use axum::{
    extract::{Path, State},
    http::{HeaderValue, StatusCode, header},
    response::{IntoResponse, Response},
};
use metrics::counter;
use serde_json::json;

use crate::state::AppState;
use crate::upstream::fetch_block_deduped;

/// GET /v0/block/:height
///
/// Fetches a block by height using the singleflight dedup + fallback chain.
/// On success, returns block JSON with `X-Upstream-Source` and `Content-Type` headers.
/// On failure (all upstreams exhausted), returns 502 with verbose per-source error details.
pub async fn block_handler(
    State(state): State<AppState>,
    Path(height): Path<u64>,
) -> Response {
    // height=0 is technically valid in NEAR but often indicates a misconfiguration.
    // Reject it early with a descriptive 400 to avoid confusing upstream errors.
    if height == 0 {
        let body = json!({ "error": "block height must be greater than 0" });
        return (
            StatusCode::BAD_REQUEST,
            [(header::CONTENT_TYPE, "application/json")],
            axum::Json(body),
        )
            .into_response();
    }

    counter!("block_proxy_requests", "endpoint" => "block").increment(1);
    state.stats.requests_block.fetch_add(1, Ordering::Relaxed);

    match fetch_block_deduped(&state, height).await {
        Ok((bytes, source)) => {
            // Build response with correct headers.
            // `bytes::Bytes` can be used directly as an axum response body.
            let source_header =
                HeaderValue::from_static(source);

            (
                StatusCode::OK,
                [
                    (header::CONTENT_TYPE, HeaderValue::from_static("application/json")),
                    (
                        header::HeaderName::from_static("x-upstream-source"),
                        source_header,
                    ),
                ],
                bytes,
            )
                .into_response()
        }
        Err(errors) => {
            // All upstreams failed — return 502 with verbose per-source error details
            // (locked decision in CONTEXT.md: verbose upstream error responses).
            let body = json!({
                "error": "all upstream sources failed",
                "height": height,
                "sources": errors,
            });
            tracing::error!(height, error_count = errors.len(), "block request failed: all upstreams exhausted");
            (
                StatusCode::BAD_GATEWAY,
                [(header::CONTENT_TYPE, "application/json")],
                axum::Json(body),
            )
                .into_response()
        }
    }
}
