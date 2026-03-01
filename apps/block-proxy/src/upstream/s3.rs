use std::time::Duration;

use aws_sdk_s3::config::{Credentials, Region};
use bytes::Bytes;
use tracing::debug;

use crate::config::Config;

/// S3/MinIO upstream fetcher.
///
/// Retrieves block data from an S3-compatible object store (MinIO for self-hosted,
/// or AWS S3 for cloud). Blocks are stored as `{height}.json` objects.
pub struct S3Upstream {
    client: aws_sdk_s3::Client,
    bucket: String,
    timeout: Duration,
}

impl S3Upstream {
    /// Creates a new `S3Upstream` from configuration.
    ///
    /// Returns `None` if any of `s3_endpoint`, `s3_bucket`, `s3_access_key`, or
    /// `s3_secret_key` is not configured. All four fields are required for MinIO
    /// access and for AWS S3 when using static credentials from config.
    pub fn new(config: &Config) -> Option<Self> {
        let endpoint = config.s3_endpoint.clone()?;
        let bucket = config.s3_bucket.clone()?;

        let region = Region::new(
            config
                .s3_region
                .clone()
                .unwrap_or_else(|| "us-east-1".to_string()),
        );

        let access_key = config.s3_access_key.clone()?;
        let secret_key = config.s3_secret_key.clone()?;

        let credentials = Credentials::new(
            access_key,
            secret_key,
            None, // session token
            None, // expiry
            "block-proxy-config",
        );

        let sdk_config = aws_sdk_s3::config::Builder::new()
            .endpoint_url(endpoint)
            .force_path_style(true) // REQUIRED for MinIO (virtual-hosted-style breaks with custom endpoints)
            .region(region)
            .credentials_provider(credentials)
            .build();

        let client = aws_sdk_s3::Client::from_conf(sdk_config);

        Some(Self {
            client,
            bucket,
            timeout: Duration::from_secs(config.upstream_timeout_secs),
        })
    }

    /// Fetches a block by height from S3/MinIO.
    ///
    /// The object key is `{height}.json`. Uses `tokio::time::timeout` to enforce
    /// the per-source timeout because the S3 SDK does not support per-request timeouts.
    pub async fn fetch(&self, height: u64) -> anyhow::Result<Bytes> {
        let key = format!("{}.json", height);
        let start = std::time::Instant::now();

        let result = tokio::time::timeout(self.timeout, async {
            let output = self
                .client
                .get_object()
                .bucket(&self.bucket)
                .key(&key)
                .send()
                .await
                .map_err(|err| {
                    // Check for NoSuchKey error and return a descriptive message
                    if let Some(service_err) = err.as_service_error() {
                        if service_err.is_no_such_key() {
                            return anyhow::anyhow!("block {} not found in S3", height);
                        }
                    }
                    anyhow::anyhow!("S3 get_object failed for key {}: {}", key, err)
                })?;

            let data = output
                .body
                .collect()
                .await
                .map_err(|e| anyhow::anyhow!("S3 body collect failed for key {}: {}", key, e))?
                .into_bytes();

            if data.len() > 100 * 1024 * 1024 {
                anyhow::bail!("S3 response too large for block {}: {} bytes", height, data.len());
            }

            Ok::<Bytes, anyhow::Error>(data)
        })
        .await
        .map_err(|_| anyhow::anyhow!("S3 fetch timed out for block {} after {:?}", height, self.timeout))??;

        let elapsed = start.elapsed();
        debug!(
            height,
            bytes = result.len(),
            latency_ms = elapsed.as_millis(),
            "S3 upstream fetch complete"
        );

        Ok(result)
    }
}
