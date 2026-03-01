use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
};

/// Application-level error wrapping `anyhow::Error`, compatible with axum handlers.
///
/// Using the official axum anyhow-error-response pattern: handlers return
/// `Result<T, AppError>` and the ? operator converts any `Into<anyhow::Error>`
/// automatically via the blanket From impl.
pub struct AppError(pub anyhow::Error);

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let body = serde_json::json!({ "error": self.0.to_string() });
        (StatusCode::INTERNAL_SERVER_ERROR, axum::Json(body)).into_response()
    }
}

/// Blanket conversion so `?` works in axum handlers returning `Result<T, AppError>`.
impl<E: Into<anyhow::Error>> From<E> for AppError {
    fn from(err: E) -> Self {
        Self(err.into())
    }
}

/// Per-source error detail included in verbose upstream failure responses (CONTEXT.md locked decision).
#[derive(Debug, Clone, serde::Serialize)]
pub struct UpstreamError {
    pub source: String,
    pub error: String,
}

/// Return type for block-serving functions.
///
/// `bytes::Bytes` — raw JSON bytes to forward to the client.
/// `&'static str` — source name for the `X-Upstream-Source` response header.
pub type BlockResult = (bytes::Bytes, &'static str);
