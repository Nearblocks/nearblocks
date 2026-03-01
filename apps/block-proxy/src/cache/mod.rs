pub mod path;
pub use self::path::block_height_to_path;

use std::path::PathBuf;
use std::sync::Arc;
use std::sync::atomic::{AtomicU64, Ordering};
use std::time::Duration;

use bytes::Bytes;
use metrics::counter;
use serde::Deserialize;

use crate::config::Config;
use crate::stats::StatsCollector;

/// Minimal structs used only to validate the block JSON contains
/// `block.header.height`. We do NOT deserialize the full block —
/// that would be expensive and fragile. This is per the anti-pattern
/// guidance in RESEARCH.md.
#[derive(Deserialize)]
struct BlockValidator {
    block: BlockOuter,
}

#[derive(Deserialize)]
struct BlockOuter {
    header: HeaderHeight,
}

#[derive(Deserialize)]
struct HeaderHeight {
    height: u64,
}

/// Filesystem-backed block cache with optional zstd compression.
///
/// # Write path
/// validate JSON -> optionally zstd compress -> tempfile in same dir -> atomic rename
///
/// # Read path
/// read file -> optionally zstd decompress -> return Bytes
///
/// # Eviction
/// Background task periodically removes recent blocks older than TTL.
/// Historical blocks (outside `recent_block_window` of chain tip) are
/// permanent and never evicted.
#[derive(Clone)]
pub struct CacheStore {
    cache_dir: PathBuf,
    cache_ttl: Duration,
    recent_block_window: u64,
    compression: bool,
}

impl CacheStore {
    /// Construct a new CacheStore from application configuration.
    pub fn new(config: &Config) -> Self {
        Self {
            cache_dir: PathBuf::from(&config.cache_dir),
            cache_ttl: Duration::from_secs(config.cache_ttl_secs),
            recent_block_window: config.recent_block_window,
            compression: config.cache_compression,
        }
    }

    /// Read a cached block by height.
    ///
    /// Returns `Ok(None)` if the block is not in cache.
    /// Returns `Ok(Some(bytes))` with decompressed JSON bytes on cache hit.
    pub async fn read(&self, height: u64) -> anyhow::Result<Option<Bytes>> {
        let path = block_height_to_path(&self.cache_dir, height, self.compression);

        let raw = match tokio::fs::read(&path).await {
            Ok(data) => data,
            Err(e) if e.kind() == std::io::ErrorKind::NotFound => {
                tracing::debug!(height, "cache miss");
                return Ok(None);
            }
            Err(e) => return Err(e.into()),
        };

        let data = if self.compression {
            tokio::task::spawn_blocking(move || {
                zstd::decode_all(raw.as_slice())
            })
            .await??
        } else {
            raw
        };

        tracing::debug!(height, bytes = data.len(), "cache hit");
        Ok(Some(Bytes::from(data)))
    }

    /// Write a block to the cache with zstd compression and atomic rename.
    ///
    /// Validates that the JSON contains `block.header.height` before writing.
    /// Uses a temp file in the same directory as the target to ensure
    /// atomic rename succeeds on the same filesystem.
    pub async fn write(&self, height: u64, json_bytes: &[u8]) -> anyhow::Result<()> {
        // Validate JSON structure and height match — ensures we never cache corrupt
        // or mismatched data.
        let validated: BlockValidator = serde_json::from_slice(json_bytes)
            .map_err(|e| anyhow::anyhow!("cache write rejected for height {}: invalid block JSON: {}", height, e))?;
        if validated.block.header.height != height {
            anyhow::bail!(
                "cache write rejected: requested height {} but block contains height {}",
                height, validated.block.header.height
            );
        }

        let path = block_height_to_path(&self.cache_dir, height, self.compression);

        // Ensure parent directories exist.
        if let Some(parent) = path.parent() {
            tokio::fs::create_dir_all(parent).await?;
        }

        let bytes_original = json_bytes.len();
        let write_bytes = if self.compression {
            let json_bytes_owned = json_bytes.to_vec();
            tokio::task::spawn_blocking(move || {
                zstd::encode_all(&json_bytes_owned[..], 3)
            })
            .await??
        } else {
            json_bytes.to_vec()
        };
        let bytes_compressed = write_bytes.len();

        // Write to a temp file in the SAME directory as the target.
        // Cross-filesystem rename is not atomic, so temp must be co-located.
        let parent_dir = path
            .parent()
            .ok_or_else(|| anyhow::anyhow!("cache path has no parent: {:?}", path))?
            .to_path_buf();

        let tmp = tokio::task::spawn_blocking(move || {
            tempfile::Builder::new()
                .prefix(".tmp-block-")
                .tempfile_in(&parent_dir)
                .map_err(|e| anyhow::anyhow!("failed to create temp file: {}", e))
        })
        .await??;

        tokio::fs::write(tmp.path(), &write_bytes).await?;

        // Atomic rename: temp -> final path. persist() consumes the NamedTempFile
        // so it is not cleaned up on drop.
        let path_clone = path.clone();
        tokio::task::spawn_blocking(move || {
            tmp.persist(&path_clone)
                .map_err(|e| anyhow::anyhow!("atomic rename failed: {}", e.error))
        })
        .await??;

        tracing::debug!(
            height,
            bytes_original,
            bytes_compressed,
            "cache write complete"
        );

        Ok(())
    }

    /// Spawn a background cache write that does not block the response path.
    ///
    /// Errors are logged at WARN level but never propagated — this is intentionally
    /// fire-and-forget. Per RESEARCH.md Pitfall 5: cache writes must not add latency
    /// to the response path.
    pub fn write_background(&self, height: u64, json_bytes: Bytes) {
        let store = self.clone();
        tokio::spawn(async move {
            if let Err(e) = store.write(height, &json_bytes).await {
                tracing::warn!(height, error = %e, "background cache write failed");
            }
        });
    }

    /// Walk the cache directory and evict recent blocks whose cached file is
    /// older than `cache_ttl`.
    ///
    /// Only blocks within `recent_block_window` of the chain tip are candidates
    /// for eviction. Older (historical) blocks are permanent.
    ///
    /// `current_tip` should be the latest known chain tip height. Pass `None`
    /// to skip eviction entirely (tip not yet known).
    pub async fn run_eviction(&self, current_tip: Option<u64>, stats: &Arc<StatsCollector>) {
        let tip = match current_tip {
            Some(t) if t > 0 => t,
            _ => {
                tracing::debug!("skipping eviction: chain tip unknown");
                return;
            }
        };

        let cache_dir = self.cache_dir.clone();
        let cache_ttl = self.cache_ttl;
        let recent_block_window = self.recent_block_window;

        let start = std::time::Instant::now();

        let result = tokio::task::spawn_blocking(move || {
            let mut scanned = 0u64;
            let mut evicted = 0u64;

            // Walk the directory tree using std::fs for blocking I/O in spawn_blocking.
            evict_recursive(
                &cache_dir,
                tip,
                recent_block_window,
                cache_ttl,
                &mut scanned,
                &mut evicted,
            );

            (scanned, evicted)
        })
        .await;

        match result {
            Ok((scanned, evicted)) => {
                if evicted > 0 {
                    counter!("block_proxy_cache_evictions").increment(evicted);
                    stats.cache_evictions.fetch_add(evicted, Ordering::Relaxed);
                }
                tracing::info!(
                    scanned,
                    evicted,
                    elapsed_ms = start.elapsed().as_millis(),
                    "cache eviction complete"
                );
            }
            Err(e) => {
                tracing::warn!(error = %e, "cache eviction task panicked");
            }
        }
    }

    /// Spawn a background eviction loop that runs every 60 seconds.
    ///
    /// `tip_height` is an `AtomicU64` shared with the last-block handler
    /// (updated in Plan 04). A value of 0 means the tip is not yet known.
    pub fn spawn_eviction_loop(
        self: Arc<Self>,
        tip_height: Arc<AtomicU64>,
        dedup: Arc<crate::state::BlockDedupGroup>,
        stats: Arc<StatsCollector>,
    ) {
        tokio::spawn(async move {
            let mut interval = tokio::time::interval(Duration::from_secs(60));
            // The first tick fires immediately; skip it so we don't run eviction
            // before the server has even served its first request.
            interval.tick().await;

            loop {
                interval.tick().await;

                let tip = tip_height.load(Ordering::Relaxed);
                let current_tip = if tip > 0 { Some(tip) } else { None };

                self.run_eviction(current_tip, &stats).await;

                // Purge stale singleflight entries from dropped leaders.
                dedup.purge_stale().await;
            }
        });
    }
}

/// Recursively walk `dir` and evict cache files for recent blocks
/// older than `cache_ttl`. Handles both `.json.zst` and `.json` files.
fn evict_recursive(
    dir: &std::path::Path,
    tip: u64,
    recent_block_window: u64,
    cache_ttl: Duration,
    scanned: &mut u64,
    evicted: &mut u64,
) {
    let entries = match std::fs::read_dir(dir) {
        Ok(e) => e,
        Err(e) => {
            tracing::warn!(dir = ?dir, error = %e, "failed to read cache directory during eviction");
            return;
        }
    };

    for entry in entries.flatten() {
        let path = entry.path();
        if path.is_dir() {
            evict_recursive(&path, tip, recent_block_window, cache_ttl, scanned, evicted);
            continue;
        }

        let filename = match path.file_name().and_then(|n| n.to_str()) {
            Some(n) => n.to_string(),
            None => continue,
        };

        // Handle both compressed (.json.zst) and uncompressed (.json) cache files.
        let stem = if filename.ends_with(".json.zst") {
            filename.trim_end_matches(".json.zst")
        } else if filename.ends_with(".json") {
            filename.trim_end_matches(".json")
        } else {
            continue;
        };
        let height: u64 = match stem.parse() {
            Ok(h) => h,
            Err(_) => continue,
        };

        *scanned += 1;

        // Only evict if within the recent block window of the tip.
        // Historical blocks are permanent.
        let is_recent = if tip >= recent_block_window {
            height > tip - recent_block_window
        } else {
            // Short/test chains: all blocks up to tip are recent.
            height <= tip
        };
        if !is_recent {
            continue;
        }

        // Check file modification time.
        let metadata = match std::fs::metadata(&path) {
            Ok(m) => m,
            Err(_) => continue,
        };

        let mtime = match metadata.modified() {
            Ok(t) => t,
            Err(_) => continue,
        };

        let age = match mtime.elapsed() {
            Ok(a) => a,
            Err(_) => continue,
        };

        if age > cache_ttl {
            match std::fs::remove_file(&path) {
                Ok(()) => {
                    *evicted += 1;
                    tracing::debug!(
                        height,
                        age_secs = age.as_secs(),
                        "evicted recent block from cache"
                    );
                }
                Err(e) => {
                    tracing::warn!(height, error = %e, "failed to evict cache file");
                }
            }
        }
    }
}
