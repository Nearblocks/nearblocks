pub mod block;
pub mod health;
pub mod last_block;
pub mod readyz;

use axum::{Router, http::HeaderName, routing::get};
use tower::ServiceBuilder;
use tower_http::{
    request_id::{MakeRequestUuid, PropagateRequestIdLayer, SetRequestIdLayer},
    trace::TraceLayer,
};

use crate::state::AppState;

use self::{
    block::block_handler,
    health::health_handler,
    last_block::last_block_final_handler,
    readyz::readyz_handler,
};

pub fn build_router(state: AppState) -> Router {
    let x_request_id = HeaderName::from_static("x-request-id");

    Router::new()
        .route("/healthz", get(health_handler))
        .route("/readyz", get(readyz_handler))
        .route("/v0/block/{height}", get(block_handler))
        .route("/v0/last_block/final", get(last_block_final_handler))
        .layer(
            ServiceBuilder::new()
                .layer(SetRequestIdLayer::new(
                    x_request_id.clone(),
                    MakeRequestUuid::default(),
                ))
                .layer(PropagateRequestIdLayer::new(x_request_id))
                .layer(TraceLayer::new_for_http()),
        )
        .with_state(state)
}
