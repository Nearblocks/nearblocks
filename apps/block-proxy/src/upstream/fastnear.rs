use std::time::Duration;

use bytes::Bytes;
use tracing::debug;

use crate::config::Config;

/// fastnear upstream fetcher.
///
/// Retrieves block data from the fastnear HTTP API (`mainnet.neardata.xyz` or
/// `testnet.neardata.xyz`). fastnear returns the canonical snake_case block format
/// so no transformation is needed — bytes are forwarded as-is.
pub struct FastnearUpstream {
    client: reqwest::Client,
    base_url: String,
    timeout: Duration,
}

impl FastnearUpstream {
    /// Creates a new `FastnearUpstream` from configuration.
    ///
    /// Builds a connection-pooled `reqwest::Client` (no client-level timeout —
    /// timeout is applied per-request per RESEARCH.md pattern 6).
    /// Maximum response body size (100 MB). Blocks can be multi-MB but
    /// anything larger than this indicates a misbehaving upstream.
    const MAX_BODY_SIZE: usize = 100 * 1024 * 1024;

    pub fn new(config: &Config) -> Self {
        let client = reqwest::Client::new();
        Self {
            client,
            base_url: config.fastnear_base_url(),
            timeout: Duration::from_secs(config.upstream_timeout_secs),
        }
    }

    /// Fetches a block by height from the fastnear API.
    ///
    /// URL: `{base_url}/v0/block/{height}`
    ///
    /// Per-request timeout is applied via `.timeout()` on the request builder.
    /// Returns raw response bytes without deserialization (fastnear format is canonical).
    pub async fn fetch(&self, height: u64) -> anyhow::Result<Bytes> {
        let url = format!("{}/v0/block/{}", self.base_url, height);
        let start = std::time::Instant::now();

        let response = self
            .client
            .get(&url)
            .timeout(self.timeout)
            .send()
            .await
            .map_err(|e| anyhow::anyhow!("fastnear request failed for block {}: {}", height, e))?;

        if response.status() == reqwest::StatusCode::NOT_FOUND {
            anyhow::bail!("block {} not found on fastnear", height);
        }

        let response = response
            .error_for_status()
            .map_err(|e| anyhow::anyhow!("fastnear returned error status for block {}: {}", height, e))?;

        let status = response.status();
        if let Some(len) = response.content_length() {
            if len as usize > Self::MAX_BODY_SIZE {
                anyhow::bail!("fastnear response too large for block {}: {} bytes", height, len);
            }
        }
        let data = response
            .bytes()
            .await
            .map_err(|e| anyhow::anyhow!("fastnear body read failed for block {}: {}", height, e))?;
        if data.len() > Self::MAX_BODY_SIZE {
            anyhow::bail!("fastnear response body too large for block {}: {} bytes", height, data.len());
        }

        let elapsed = start.elapsed();
        debug!(
            height,
            status = status.as_u16(),
            bytes = data.len(),
            latency_ms = elapsed.as_millis(),
            "fastnear upstream fetch complete"
        );

        Ok(data)
    }

    /// Fetches the latest finalized block from the fastnear API.
    ///
    /// URL: `{base_url}/v0/last_block/final`
    ///
    /// Used by the `/v0/last_block/final` endpoint handler. This result is NOT
    /// cached (per ENDP-02) — the handler calls this directly each time.
    pub async fn fetch_last_block_final(&self) -> anyhow::Result<Bytes> {
        let url = format!("{}/v0/last_block/final", self.base_url);
        let start = std::time::Instant::now();

        let response = self
            .client
            .get(&url)
            .timeout(self.timeout)
            .send()
            .await
            .map_err(|e| anyhow::anyhow!("fastnear last_block/final request failed: {}", e))?;

        if response.status() == reqwest::StatusCode::NOT_FOUND {
            anyhow::bail!("last_block/final not found on fastnear");
        }

        let response = response
            .error_for_status()
            .map_err(|e| anyhow::anyhow!("fastnear returned error status for last_block/final: {}", e))?;

        let status = response.status();
        if let Some(len) = response.content_length() {
            if len as usize > Self::MAX_BODY_SIZE {
                anyhow::bail!("fastnear response too large for last_block/final: {} bytes", len);
            }
        }
        let data = response
            .bytes()
            .await
            .map_err(|e| anyhow::anyhow!("fastnear body read failed for last_block/final: {}", e))?;
        if data.len() > Self::MAX_BODY_SIZE {
            anyhow::bail!("fastnear response body too large for last_block/final: {} bytes", data.len());
        }

        let elapsed = start.elapsed();
        debug!(
            status = status.as_u16(),
            bytes = data.len(),
            latency_ms = elapsed.as_millis(),
            "fastnear last_block/final fetch complete"
        );

        Ok(data)
    }
}
