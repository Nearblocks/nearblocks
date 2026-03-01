use serde::Deserialize;

#[derive(Deserialize, Debug)]
pub struct Config {
    // --- Phase 1 fields ---
    #[serde(default = "default_port")]
    pub port: u16,

    #[serde(default = "default_log_level")]
    pub log_level: String,

    /// Optional RUST_LOG override — read by the env-filter tracing layer directly
    /// from the environment; stored here for completeness and config summary logging.
    #[allow(dead_code)]
    pub rust_log: Option<String>,

    // --- Phase 2: Network ---
    /// "mainnet" or "testnet"
    #[serde(default = "default_network")]
    pub network: String,

    // --- Phase 2: Cache ---
    #[serde(default = "default_cache_dir")]
    pub cache_dir: String,

    #[serde(default = "default_cache_enabled")]
    pub cache_enabled: bool,

    /// TTL for recent block eviction in seconds (default 1 hour)
    #[serde(default = "default_cache_ttl_secs")]
    pub cache_ttl_secs: u64,

    /// Number of blocks behind tip considered "recent" (recent blocks may not be final yet)
    #[serde(default = "default_recent_block_window")]
    pub recent_block_window: u64,

    /// Enable zstd compression for cached blocks (default true).
    /// When false, blocks are stored as raw JSON on disk.
    #[serde(default = "default_true")]
    pub cache_compression: bool,

    // --- Phase 2: Upstream enable/disable (PRXY-06) ---
    #[serde(default = "default_true")]
    pub s3_enabled: bool,

    #[serde(default = "default_true")]
    pub fastnear_enabled: bool,

    #[serde(default = "default_true")]
    pub near_lake_enabled: bool,

    // --- Phase 2: S3/MinIO ---
    pub s3_endpoint: Option<String>,
    pub s3_bucket: Option<String>,
    pub s3_region: Option<String>,
    pub s3_access_key: Option<String>,
    pub s3_secret_key: Option<String>,

    // --- Phase 2: fastnear ---
    /// Override fastnear base URL; if None, derived from network field
    pub fastnear_url: Option<String>,

    // --- Phase 2: NEAR Lake ---
    /// Override NEAR Lake bucket; if None, derived from network field
    pub near_lake_bucket: Option<String>,

    #[serde(default = "default_near_lake_region")]
    pub near_lake_region: String,

    // --- Phase 2: Timeouts (PRXY-07) ---
    /// Per-source upstream request timeout in seconds
    #[serde(default = "default_upstream_timeout_secs")]
    pub upstream_timeout_secs: u64,

    // --- Phase 4: Admin ---
    /// Port for the admin server (metrics and stats).
    #[serde(default = "default_admin_port")]
    pub admin_port: u16,
}

fn default_port() -> u16 {
    3000
}

fn default_log_level() -> String {
    "info".to_string()
}

fn default_network() -> String {
    "mainnet".to_string()
}

fn default_cache_dir() -> String {
    "/tmp/block-proxy-cache".to_string()
}

fn default_cache_enabled() -> bool {
    true
}

fn default_cache_ttl_secs() -> u64 {
    3600
}

fn default_recent_block_window() -> u64 {
    1000
}

fn default_true() -> bool {
    true
}

fn default_near_lake_region() -> String {
    "eu-central-1".to_string()
}

fn default_upstream_timeout_secs() -> u64 {
    7
}

fn default_admin_port() -> u16 {
    3001
}

impl Config {
    pub fn from_env() -> Result<Self, envy::Error> {
        envy::from_env::<Config>()
    }

    /// Returns the effective fastnear base URL (override or derived from network).
    pub fn fastnear_base_url(&self) -> String {
        if let Some(ref url) = self.fastnear_url {
            return url.clone();
        }
        match self.network.as_str() {
            "testnet" => "https://testnet.neardata.xyz".to_string(),
            _ => "https://mainnet.neardata.xyz".to_string(),
        }
    }

    /// Returns the effective NEAR Lake S3 bucket name (override or derived from network).
    pub fn near_lake_bucket_name(&self) -> String {
        if let Some(ref bucket) = self.near_lake_bucket {
            return bucket.clone();
        }
        match self.network.as_str() {
            "testnet" => "near-lake-data-testnet".to_string(),
            _ => "near-lake-data-mainnet".to_string(),
        }
    }

    /// Logs all effective configuration values at startup.
    /// Secrets (s3_access_key, s3_secret_key) are masked to first 4 chars + "***".
    pub fn log_summary(&self) {
        fn mask(val: &Option<String>) -> String {
            match val {
                None => "<unset>".to_string(),
                Some(s) if s.len() <= 4 => "***".to_string(),
                Some(s) => format!("{}***", &s[..4]),
            }
        }

        tracing::info!(
            port = self.port,
            log_level = %self.log_level,
            network = %self.network,
            cache_dir = %self.cache_dir,
            cache_enabled = self.cache_enabled,
            cache_compression = self.cache_compression,
            cache_ttl_secs = self.cache_ttl_secs,
            recent_block_window = self.recent_block_window,
            s3_enabled = self.s3_enabled,
            fastnear_enabled = self.fastnear_enabled,
            near_lake_enabled = self.near_lake_enabled,
            s3_endpoint = ?self.s3_endpoint,
            s3_bucket = ?self.s3_bucket,
            s3_region = ?self.s3_region,
            s3_access_key = %mask(&self.s3_access_key),
            s3_secret_key = %mask(&self.s3_secret_key),
            fastnear_url = %self.fastnear_base_url(),
            near_lake_bucket = %self.near_lake_bucket_name(),
            near_lake_region = %self.near_lake_region,
            upstream_timeout_secs = self.upstream_timeout_secs,
            admin_port = self.admin_port,
            "block-proxy config"
        );
    }
}
