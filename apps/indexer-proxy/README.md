# Indexer Proxy

HTTP proxy for NEAR block data with automatic failover and background S3 uploads.

## Problem

S3 outages block indexer operations. When S3 fails, indexers can't fetch blocks and all downstream processing stops.

## Solution

The proxy provides automatic failover across multiple data sources:

```
Memory Cache → S3 → Neardata → NEAR Lake
```

- S3 uploads happen in background, indexers never wait
- Automatic failover to Neardata if S3 is unavailable
- Missing blocks are re-uploaded to S3 when accessed
- No persistent state required

## Architecture

```
┌────────────────┐
│   Indexers     │
│ (balance, etc) │
└───────┬────────┘
        │ HTTP
┌───────▼──────────────────┐
│   Indexer Proxy          │
│                          │
│  1. Memory Cache (LRU)   │
│  2. S3 Bucket            │
│  3. Neardata (Fastnear)  │
│  4. NEAR Lake            │
│                          │
│  Background Upload Queue │
└──────────────────────────┘
```

## Quick Start

### 1. Deploy Proxy

```bash
# Build
yarn build

# Configure (see .env.mainnet.example or .env.testnet.example)
export NETWORK=mainnet
export S3_BUCKET=nearblocks-mainnet
export S3_ENDPOINT=https://s3.example.com
export S3_ACCESS_KEY_ID=xxx
export S3_SECRET_ACCESS_KEY=xxx

# Run
yarn start
```

### 2. Verify

```bash
curl http://localhost:3000/health
```

Indexers are already configured to use the proxy via `PROXY_URL` environment variable.

## API

### `GET /block/:height`

Fetch a single block. Returns 404 if block not found.

**Response:**

```json
{
  "block": {
    /* block data */
  },
  "source": "cache|s3|neardata|near_lake"
}
```

### `POST /blocks`

Batch fetch (max 100 blocks).

### `GET /health`

Health check with metrics:

```json
{
  "status": "ok",
  "cacheSize": 1234,
  "queueSize": 56
}
```

### `GET /metrics`

Prometheus metrics endpoint.

## Configuration

| Variable                     | Description              | Default   |
| ---------------------------- | ------------------------ | --------- |
| `NETWORK`                    | mainnet or testnet       | `mainnet` |
| `PORT`                       | HTTP server port         | `3000`    |
| `CACHE_MAX_BLOCKS`           | Max blocks in cache      | `5000`    |
| `CACHE_TTL_MS`               | Cache TTL (ms)           | `3600000` |
| `LAKE_AWS_ACCESS_KEY_ID`     | AWS key for NEAR Lake    | -         |
| `LAKE_AWS_SECRET_ACCESS_KEY` | AWS secret for NEAR Lake | -         |
| `S3_BUCKET`                  | S3 bucket name           | -         |
| `S3_ENDPOINT`                | S3 endpoint URL          | -         |
| `S3_ACCESS_KEY_ID`           | S3 access key            | -         |
| `S3_SECRET_ACCESS_KEY`       | S3 secret key            | -         |
| `S3_UPLOAD_BATCH_SIZE`       | Concurrent uploads       | `10`      |
| `S3_UPLOAD_MAX_RETRIES`      | Max upload retries       | `5`       |

Neardata URL is derived from `NETWORK` (mainnet → https://mainnet.neardata.xyz, testnet → https://testnet.neardata.xyz).

## Cache Retention

The in-memory cache retains up to `CACHE_MAX_BLOCKS` (default: 5000) most recently accessed blocks using an LRU eviction policy. Blocks are cached for `CACHE_TTL_MS` (default: 1 hour) before expiring.

Cache is ephemeral and cleared on restart. The proxy doesn't persist blocks to disk by default.

## Deployment

### Kubernetes

Deploy two instances (mainnet and testnet):

```yaml
# Mainnet
apiVersion: apps/v1
kind: Deployment
metadata:
  name: indexer-proxy-mainnet
spec:
  replicas: 1
  template:
    spec:
      containers:
        - name: proxy
          image: indexer-proxy:latest
          env:
            - name: NETWORK
              value: 'mainnet'
            - name: S3_BUCKET
              value: 'nearblocks-mainnet'
          resources:
            requests:
              memory: '2Gi'
              cpu: '500m'
            limits:
              memory: '4Gi'
              cpu: '2000m'
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            periodSeconds: 10
```

The proxy doesn't require persistent storage. All data is kept in memory and lost on restart, which is expected behavior since blocks can be re-fetched from upstream sources.

## How It Works

Request flow:

1. Check memory cache
2. If not cached, check S3
3. If not in S3, fetch from Neardata
4. If Neardata fails, fallback to NEAR Lake
5. Return block immediately (or 404 if not found)
6. Queue block for background S3 upload if fetched from Neardata/Lake

After a crash with pending uploads:

- Blocks are already processed by indexers
- Missing S3 blocks are re-uploaded when accessed again
- NEAR Lake provides ultimate fallback for any missing data

## Monitoring

### Key Metrics

```promql
# Cache hit rate
rate(proxy_block_fetch_by_source_total{source="cache"}[5m])
/
rate(proxy_block_fetch_total[5m])

# Upload queue depth (should stay low)
proxy_s3_upload_queue_size

# Upload success rate (should be >99%)
rate(proxy_s3_upload_success_total[5m])
/
(rate(proxy_s3_upload_success_total[5m]) + rate(proxy_s3_upload_failure_total[5m]))
```

### Alerts

```yaml
- alert: ProxyS3UploadQueueHigh
  expr: proxy_s3_upload_queue_size > 1000
  for: 10m
  annotations:
    summary: 'S3 upload queue backing up'

- alert: ProxyUploadFailureRate
  expr: |
    rate(proxy_s3_upload_failure_total[5m])
    /
    rate(proxy_s3_upload_total[5m]) > 0.05
  for: 5m
  annotations:
    summary: 'High S3 upload failure rate'
```

## Troubleshooting

**High queue size**

- S3 is down or slow
- Check `proxy_s3_upload_duration_seconds` metric
- Proxy continues serving from Neardata
- Queue drains when S3 recovers

**Missing S3 files**

- Expected after crashes
- Blocks are re-uploaded when accessed
- Check `proxy_block_fetch_by_source_total{source="neardata"}` metric

**Bypass proxy**

```bash
# If proxy has issues, indexers can use S3 directly
kubectl set env deployment/indexer-balance PROXY_URL-
```

## Development

```bash
# Install
yarn install

# Build
yarn build

# Lint
yarn lint

# Run
yarn start
```

## Design Notes

The proxy is stateless and ephemeral. No persistent storage, no coordination between instances, no complex retry logic. Duplicate uploads are fine since S3 writes are idempotent. Missing blocks get re-uploaded when accessed.
