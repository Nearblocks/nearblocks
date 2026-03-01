# block-proxy

Caching reverse proxy for NEAR block data. Sits between indexers and upstream sources (neardata, S3/MinIO, NEAR Lake), deduplicates concurrent requests, and serves blocks from a local disk cache when possible.

Mirrors the neardata API — serves `/v0/block/{height}` and `/v0/last_block/final` — so existing indexers can point at it by changing a single URL.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/v0/block/{height}` | Returns block JSON. Checks cache first, then falls back through enabled upstreams. |
| GET | `/v0/last_block/final` | Proxies to neardata for the latest finalized block. Never cached. |
| GET | `/healthz` | Returns 200 when the service is running. |
| GET | `/readyz` | Returns 200 when the service is ready to serve traffic. |

All block responses include an `X-Upstream-Source` header indicating where the data came from (`cache`, `s3`, `fastnear`, or `near_lake`).

## Fallback order

1. Local disk cache
2. S3/MinIO
3. neardata
4. NEAR Lake (S3 bucket with shard reassembly)

Each source can be independently enabled or disabled. If all enabled sources fail, returns 502 with per-source error details.

## Environment variables

### General

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | HTTP listen port |
| `LOG_LEVEL` | `info` | Log level (`debug`, `info`, `warn`, `error`) |
| `RUST_LOG` | — | Override log filter (e.g. `block_proxy=debug,tower_http=info`) |
| `NETWORK` | `mainnet` | `mainnet` or `testnet` — determines default upstream URLs |

### Cache

| Variable | Default | Description |
|----------|---------|-------------|
| `CACHE_ENABLED` | `true` | Enable local disk cache |
| `CACHE_DIR` | `/tmp/block-proxy-cache` | Cache storage directory |
| `CACHE_TTL_SECS` | `3600` | TTL in seconds for recent block eviction |
| `RECENT_BLOCK_WINDOW` | `1000` | Blocks behind chain tip considered "recent" (older blocks are never evicted) |

### Upstream sources

| Variable | Default | Description |
|----------|---------|-------------|
| `S3_ENABLED` | `true` | Enable S3/MinIO source |
| `S3_ENDPOINT` | — | MinIO/S3 endpoint URL |
| `S3_BUCKET` | — | Bucket name |
| `S3_REGION` | — | Region |
| `S3_ACCESS_KEY` | — | Access key |
| `S3_SECRET_KEY` | — | Secret key |
| `FASTNEAR_ENABLED` | `true` | Enable neardata source |
| `FASTNEAR_URL` | — | Override neardata URL (default: derived from `NETWORK`) |
| `NEAR_LAKE_ENABLED` | `true` | Enable NEAR Lake source |
| `NEAR_LAKE_BUCKET` | — | Override Lake bucket (default: derived from `NETWORK`) |
| `NEAR_LAKE_REGION` | `eu-central-1` | NEAR Lake S3 region |
| `UPSTREAM_TIMEOUT_SECS` | `7` | Per-source request timeout |

## Running

```bash
# Docker Compose (mainnet)
docker compose -f mainnet-block-proxy.yml up -d

# Docker Compose (testnet)
docker compose -f testnet-block-proxy.yml up -d

# Cargo (development)
cd apps/block-proxy
cargo run
```

## Indexer configuration

Point any indexer that uses neardata at block-proxy instead:

```
FASTNEAR_ENDPOINT=http://block-proxy:3000
```

For indexers using `nb-blocks-minio`, switch to `nb-blocks-proxy` and set:

```
PROXY_URL=http://block-proxy:3000
```
