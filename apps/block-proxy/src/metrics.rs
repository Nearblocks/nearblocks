use metrics_exporter_prometheus::{PrometheusBuilder, PrometheusHandle};

/// Install the global Prometheus metrics recorder and return the handle
/// used to render the `/metrics` endpoint.
///
/// Must be called exactly once, before any `counter!` / `histogram!` /
/// `gauge!` macros are invoked — otherwise the macros silently no-op.
pub fn init_prometheus() -> PrometheusHandle {
    PrometheusBuilder::new()
        .install_recorder()
        .expect("failed to install Prometheus recorder")
}
