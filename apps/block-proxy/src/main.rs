mod admin;
mod cache;
mod config;
mod error;
mod logging;
mod metrics;
mod state;
mod stats;
mod routes;
mod upstream;

#[tokio::main]
async fn main() {
    let config = config::Config::from_env().unwrap_or_else(|e| {
        eprintln!("Configuration error: {e}");
        std::process::exit(1);
    });

    logging::init_tracing(&config.log_level);

    config.log_summary();

    tracing::info!(port = config.port, log_level = %config.log_level, "block-proxy starting");

    // Install the Prometheus metrics recorder before creating state or any
    // code path that calls counter!/histogram!/gauge!.
    let metrics_handle = metrics::init_prometheus();

    // Create the cache directory at startup — fail fast if it cannot be created.
    tokio::fs::create_dir_all(&config.cache_dir)
        .await
        .unwrap_or_else(|e| {
            tracing::error!(cache_dir = %config.cache_dir, error = %e, "failed to create cache directory");
            std::process::exit(1);
        });

    let admin_port = config.admin_port;
    let state = state::AppState::new(config, metrics_handle).await;
    let app = routes::build_router(state.clone());

    let listener = tokio::net::TcpListener::bind(format!("0.0.0.0:{}", state.config.port))
        .await
        .unwrap_or_else(|e| {
            tracing::error!(error = %e, "failed to bind data port");
            std::process::exit(1);
        });

    tracing::info!(addr = %format!("0.0.0.0:{}", state.config.port), "data server listening");

    // Bind the admin server on a separate port.
    let admin_app = admin::build_admin_router(state.clone());
    let admin_listener = tokio::net::TcpListener::bind(format!("0.0.0.0:{}", admin_port))
        .await
        .unwrap_or_else(|e| {
            tracing::error!(error = %e, "failed to bind admin port");
            std::process::exit(1);
        });

    tracing::info!(addr = %format!("0.0.0.0:{}", admin_port), "admin server listening");

    state.set_ready();

    // Spawn background eviction loop — removes recent blocks older than cache TTL.
    state.cache.clone().spawn_eviction_loop(
        state.tip_height.clone(),
        state.dedup.clone(),
        state.stats.clone(),
    );

    // Graceful shutdown: drain in-flight requests on both servers when the
    // process receives SIGTERM (k8s pod termination) or Ctrl-C.
    // Use a watch channel to broadcast the signal to both servers.
    let (shutdown_tx, _) = tokio::sync::watch::channel(());

    let mut data_shutdown_rx = shutdown_tx.subscribe();
    let mut admin_shutdown_rx = shutdown_tx.subscribe();

    // Spawn the signal listener — drops shutdown_tx to notify all receivers.
    tokio::spawn(async move {
        #[cfg(unix)]
        {
            let ctrl_c = tokio::signal::ctrl_c();
            let mut sigterm =
                tokio::signal::unix::signal(tokio::signal::unix::SignalKind::terminate())
                    .expect("failed to register SIGTERM handler");
            tokio::select! {
                _ = ctrl_c => {},
                _ = sigterm.recv() => {},
            }
        }

        #[cfg(not(unix))]
        {
            tokio::signal::ctrl_c().await.ok();
        }

        tracing::info!("shutdown signal received, draining in-flight requests");
        drop(shutdown_tx);
    });

    // Run both servers concurrently — exit if either fails or shutdown is signalled.
    tokio::select! {
        result = axum::serve(listener, app)
            .with_graceful_shutdown(async move { data_shutdown_rx.changed().await.ok(); }) =>
        {
            if let Err(e) = result {
                tracing::error!(error = %e, "data server error");
                std::process::exit(1);
            }
        }
        result = axum::serve(admin_listener, admin_app)
            .with_graceful_shutdown(async move { admin_shutdown_rx.changed().await.ok(); }) =>
        {
            if let Err(e) = result {
                tracing::error!(error = %e, "admin server error");
                std::process::exit(1);
            }
        }
    }

    tracing::info!("block-proxy shut down cleanly");
}
