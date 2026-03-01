use std::time::Duration;

use aws_sdk_s3::config::Region;
use bytes::Bytes;
use futures::future::try_join_all;
use tracing::debug;

use crate::config::Config;

/// NEAR Lake upstream fetcher with shard assembly.
///
/// NEAR Lake stores blocks as multiple separate S3 objects:
/// - `{padded_height}/block.json` — block header and metadata
/// - `{padded_height}/shard_{i}.json` — one object per shard
///
/// This fetcher retrieves all objects concurrently and assembles them into the
/// fastnear-compatible single-object format: `{"block": ..., "shards": [...]}`.
/// This enables the fallback chain to treat all upstream sources uniformly (PRXY-09).
pub struct NearLakeUpstream {
    client: aws_sdk_s3::Client,
    bucket: String,
    timeout: Duration,
}

impl NearLakeUpstream {
    /// Creates a new `NearLakeUpstream` from configuration.
    ///
    /// Uses the default AWS credential chain (env vars, instance metadata, etc.) —
    /// NOT MinIO credentials. NEAR Lake data is hosted on real AWS S3.
    ///
    /// Region defaults to "eu-central-1" (where NEAR Lake S3 buckets are hosted).
    pub async fn new(config: &Config) -> Self {
        let region = Region::new(config.near_lake_region.clone());

        let sdk_config = aws_config::defaults(aws_config::BehaviorVersion::latest())
            .region(region)
            .load()
            .await;

        let client = aws_sdk_s3::Client::new(&sdk_config);

        Self {
            client,
            bucket: config.near_lake_bucket_name(),
            timeout: Duration::from_secs(config.upstream_timeout_secs),
        }
    }

    /// Fetches a single S3 object and returns its body bytes.
    ///
    /// Returns a descriptive error if the key does not exist (NoSuchKey).
    /// Takes an owned String so the future does not borrow from the caller.
    async fn get_object_owned(&self, key: String) -> anyhow::Result<Bytes> {
        let output = self
            .client
            .get_object()
            .bucket(&self.bucket)
            .key(&key)
            .request_payer(aws_sdk_s3::types::RequestPayer::Requester)
            .send()
            .await
            .map_err(|err| {
                if let Some(service_err) = err.as_service_error() {
                    if service_err.is_no_such_key() {
                        return anyhow::anyhow!("NEAR Lake object not found: {}", key);
                    }
                }
                anyhow::anyhow!("NEAR Lake get_object failed for key {}: {}", key, err)
            })?;

        let data = output
            .body
            .collect()
            .await
            .map_err(|e| anyhow::anyhow!("NEAR Lake body collect failed for key {}: {}", key, e))?
            .into_bytes();

        if data.len() > 100 * 1024 * 1024 {
            anyhow::bail!("NEAR Lake response too large for key {}: {} bytes", key, data.len());
        }

        Ok(data)
    }

    /// Fetches a block by height from NEAR Lake and assembles the shard data.
    ///
    /// Steps:
    /// 1. Zero-pad height to 12 digits
    /// 2. Fetch `{padded}/block.json`
    /// 3. Read actual shard IDs from `block.chunks[].shard_id` (matching
    ///    the approach used by near-lake-framework-rs — shard IDs may not
    ///    be sequential after dynamic resharding)
    /// 4. Fetch all `{padded}/shard_{id}.json` concurrently via try_join_all
    /// 5. Assemble into `{"block": <block>, "shards": [<shard_0>, ...]}`
    /// 6. Serialize and return as Bytes
    ///
    /// The entire operation is wrapped in `tokio::time::timeout` to enforce the
    /// per-source timeout (PRXY-07).
    pub async fn fetch(&self, height: u64) -> anyhow::Result<Bytes> {
        let start = std::time::Instant::now();

        let result = tokio::time::timeout(self.timeout, async {
            let padded = format!("{:012}", height);

            // Fetch block.json
            let block_key = format!("{}/block.json", padded);
            let block_bytes = self.get_object_owned(block_key).await?;

            // Parse block to extract shard IDs from chunks array.
            let block_value: serde_json::Value = serde_json::from_slice(&block_bytes)
                .map_err(|e| anyhow::anyhow!("NEAR Lake block.json parse failed for height {}: {}", height, e))?;

            // Extract actual shard IDs from block.chunks[].shard_id.
            // This matches how near-lake-framework-rs determines which shard
            // files to fetch — shard IDs may not be sequential (e.g. after
            // dynamic resharding).
            let chunks = block_value
                .get("chunks")
                .and_then(|c| c.as_array())
                .ok_or_else(|| anyhow::anyhow!(
                    "NEAR Lake block.json missing chunks array for height {}", height
                ))?;

            let shard_ids: Vec<u64> = chunks
                .iter()
                .enumerate()
                .map(|(i, chunk)| {
                    chunk.get("shard_id")
                        .and_then(|v| v.as_u64())
                        .ok_or_else(|| anyhow::anyhow!(
                            "NEAR Lake chunk {} missing shard_id for height {}", i, height
                        ))
                })
                .collect::<anyhow::Result<Vec<_>>>()?;

            // Fetch all shards concurrently using actual shard IDs
            let shard_futures: Vec<_> = shard_ids
                .iter()
                .map(|&id| {
                    let key = format!("{}/shard_{}.json", padded, id);
                    self.get_object_owned(key)
                })
                .collect();

            let shard_bytes_vec: Vec<Bytes> = try_join_all(shard_futures)
                .await
                .map_err(|e| anyhow::anyhow!("NEAR Lake shard fetch failed for height {}: {}", height, e))?;

            // Parse each shard as raw JSON
            let shards: Vec<serde_json::Value> = shard_bytes_vec
                .iter()
                .enumerate()
                .map(|(i, shard_bytes)| {
                    serde_json::from_slice(shard_bytes).map_err(|e| {
                        anyhow::anyhow!("NEAR Lake shard_{}.json parse failed for height {}: {}", shard_ids[i], height, e)
                    })
                })
                .collect::<anyhow::Result<Vec<_>>>()?;

            // Assemble into fastnear-compatible shape: {"block": ..., "shards": [...]}
            let assembled = serde_json::json!({
                "block": block_value,
                "shards": shards,
            });

            let serialized = serde_json::to_string(&assembled)
                .map_err(|e| anyhow::anyhow!("NEAR Lake assembly serialization failed for height {}: {}", height, e))?;

            Ok::<Bytes, anyhow::Error>(Bytes::from(serialized))
        })
        .await
        .map_err(|_| anyhow::anyhow!("NEAR Lake fetch timed out for block {} after {:?}", height, self.timeout))??;

        let elapsed = start.elapsed();
        debug!(
            height,
            bytes = result.len(),
            latency_ms = elapsed.as_millis(),
            "NEAR Lake upstream fetch complete"
        );

        Ok(result)
    }
}
