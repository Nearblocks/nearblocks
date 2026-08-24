# block-proxy

Caching reverse proxy for NEAR block data. Sits between indexers and upstream block sources (fastnear/neardata, S3/MinIO), providing:

- **Local disk cache** with sharded storage and TTL-based eviction
- **Singleflight dedup** — concurrent requests for the same block height are collapsed into one upstream fetch
- **Fallback chain** — cache → S3/MinIO → fastnear, with per-source metrics
- **Prometheus metrics** and JSON stats on a separate admin port

## Quick Start

The proxy is URL-compatible with neardata.xyz — any client that fetches `/v0/block/{height}` or `/v0/last_block/final` can point at the proxy instead.

```bash
# Minimal config — fastnear-only proxy, no S3
FASTNEAR_ENABLED=true S3_ENABLED=false node dist/index.js
```

All env vars have safe defaults. With zero config, the proxy starts on port 3000 serving mainnet blocks via fastnear.

## API

### Data Plane (default port 3000)

| Method | Path                   | Description                                                          |
| ------ | ---------------------- | -------------------------------------------------------------------- |
| GET    | `/v0/block/:height`    | Fetch block by height. Returns JSON with `X-Upstream-Source` header. |
| GET    | `/v0/last_block/final` | Latest finalized block (proxied from fastnear, never cached).        |
| GET    | `/healthz`             | Health check — always returns 200.                                   |
| GET    | `/readyz`              | Readiness — returns 200 when ready, 503 during startup.              |

### Admin Plane (default port 3001)

| Method | Path       | Description                                                   |
| ------ | ---------- | ------------------------------------------------------------- |
| GET    | `/metrics` | Prometheus metrics (text/plain).                              |
| GET    | `/stats`   | JSON stats snapshot with hit rates, latencies, dedup savings. |

## Environment Variables

### Core

| Variable     | Default   | Description                                             |
| ------------ | --------- | ------------------------------------------------------- |
| `PORT`       | `3000`    | Data server listen port                                 |
| `ADMIN_PORT` | `3001`    | Admin server listen port                                |
| `NETWORK`    | `mainnet` | `mainnet` or `testnet` — controls default upstream URLs |
| `LOG_LEVEL`  | `info`    | Log level (debug, info, warn, error)                    |

### Cache

| Variable            | Default      | Description                                  |
| ------------------- | ------------ | -------------------------------------------- |
| `CACHE_ENABLED`     | `true`       | Enable local disk cache                      |
| `CACHE_DIR`         | `/app/cache` | Cache directory path                         |
| `CACHE_TTL_SECS`    | `3600`       | TTL for cached block eviction (seconds)      |
| `CACHE_COMPRESSION` | `false`      | Reserved for future zstd compression support |

### Timeouts

| Variable                | Default | Description                                                  |
| ----------------------- | ------- | ------------------------------------------------------------ |
| `UPSTREAM_TIMEOUT_SECS` | `10`    | Per-upstream timeout. Must be below the 30s client abort.    |
| `DEDUP_TTL_SECS`        | `25`    | Max lifetime of an in-flight singleflight entry. Range 5-30. |

### Upstream: fastnear (neardata.xyz)

| Variable           | Default                  | Description                |
| ------------------ | ------------------------ | -------------------------- |
| `FASTNEAR_ENABLED` | `true`                   | Enable fastnear upstream   |
| `FASTNEAR_URL`     | _(derived from NETWORK)_ | Override fastnear base URL |

### Upstream: S3/MinIO

| Variable        | Default                 | Description              |
| --------------- | ----------------------- | ------------------------ |
| `S3_ENABLED`    | `false`                 | Enable S3/MinIO upstream |
| `S3_ENDPOINT`   | _(required if enabled)_ | S3/MinIO endpoint URL    |
| `S3_BUCKET`     | _(required if enabled)_ | Bucket name              |
| `S3_REGION`     | `us-east-1`             | S3 region                |
| `S3_ACCESS_KEY` | _(required if enabled)_ | Access key               |
| `S3_SECRET_KEY` | _(required if enabled)_ | Secret key               |

## Architecture

```
                    ┌──────────────┐
  indexers ───────► │  block-proxy │
                    │  :3000       │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
         ┌────────┐  ┌──────────┐  ┌──────────┐
         │ cache  │  │ S3/MinIO │  │ fastnear  │
         │ (disk) │  │          │  │ neardata  │
         └────────┘  └──────────┘  └──────────┘
```

Fallback order: cache → S3 → fastnear. On any upstream hit, the block is written to cache in the background.

### Singleflight Dedup

When multiple indexers request the same block simultaneously, only one upstream fetch is made. All other requests wait for the leader's result. This prevents upstream stampede.

### Cache Eviction

Every 60 seconds, the eviction loop scans the cache directory and removes any cached block file older than `CACHE_TTL_SECS`.

## Docker

```bash
docker build -f apps/block-proxy/Dockerfile -t block-proxy .
docker run -p 3000:3000 -p 3001:3001 block-proxy
```

## Connecting Indexers

Since block-proxy is URL-compatible with neardata.xyz, any indexer using `nb-neardata` can point to it:

```bash
# In your indexer's env
NEARDATA_URL=http://localhost:3000
```

The `nb-neardata` package accepts an optional `url` field that overrides the default neardata.xyz endpoint.
