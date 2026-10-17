# block-proxy

Caching proxy for finalized NEAR blocks and node JSON-RPC. Blocks are read from
the disk cache first, then from the sources in `BLOCK_SOURCES`, in order.
Concurrent requests for the same height share one upstream fetch.

```bash
BLOCK_SOURCES=node,neardata NODE_RPC_URL=http://127.0.0.1:3030 node dist/index.js
```

## Sources

| Source     | Serves                                                                         |
| ---------- | ------------------------------------------------------------------------------ |
| `node`     | Blocks indexed from `NODE_RPC_URL`, from the follower's start (within the TTL) |
| `proxy`    | Another block-proxy at `BLOCK_PROXY_UPSTREAM_URL`                              |
| `neardata` | neardata.xyz, or `NEARDATA_URL`                                                |
| `s3`       | An S3/MinIO block store                                                        |

The `node` source needs a node that tracks all shards, saves transaction
outcomes and serves `EXPERIMENTAL_indexer_block`. The follower does not fetch
older blocks on demand, so keep a remote source listed if indexers need
history beyond `CACHE_TTL_SECS`. The old `FASTNEAR_*` settings still work as
aliases for `NEARDATA_*`.

## API

| Method | Path                   | Port | Description                                           |
| ------ | ---------------------- | ---- | ----------------------------------------------------- |
| GET    | `/v0/last_block/final` | 3000 | Redirects to the latest finalized block               |
| GET    | `/v0/block/:height`    | 3000 | Block JSON; `X-Upstream-Source` names the source      |
| POST   | `/rpc`                 | 3000 | JSON-RPC to `NODE_RPC_URL`, allowlisted methods       |
| GET    | `/healthz`, `/readyz`  | 3000 | Liveness and readiness (no key required)              |
| GET    | `/metrics`, `/stats`   | 3001 | Prometheus metrics and JSON stats (loopback, no auth) |

When `PROXY_API_KEY` is set, data routes require it as `?api_key=`,
`Authorization: Bearer` or `X-API-Key`.

## Configuration

| Variable                       | Default                 | Notes                                               |
| ------------------------------ | ----------------------- | --------------------------------------------------- |
| `BLOCK_SOURCES`                | _(legacy flags)_        | e.g. `node,proxy,neardata`                          |
| `NETWORK`                      | `mainnet`               | `mainnet` or `testnet`                              |
| `PORT` / `ADMIN_PORT`          | `3000` / `3001`         |                                                     |
| `LISTEN_HOST`                  | `127.0.0.1`             | Non-loopback requires `PROXY_API_KEY`               |
| `PROXY_API_KEY`                | _(unset)_               | Client key                                          |
| `NODE_RPC_URL`                 | `http://127.0.0.1:3030` | `node` source and `/rpc`                            |
| `RPC_ALLOWED_METHODS`          | read-only set           | Methods `/rpc` forwards; others get JSON-RPC -32601 |
| `INDEXER_STATE_DIR`            | `/app/state`            | Follower checkpoint                                 |
| `INDEXER_INTERVAL_MS`          | `250`                   | Finalized-head poll interval                        |
| `NODE_MAX_LAG_SECS`            | `10`                    | Node out of sync when its head is older; min `5`    |
| `BLOCK_PROXY_UPSTREAM_URL`     | _(unset)_               | Required for the `proxy` source                     |
| `BLOCK_PROXY_UPSTREAM_API_KEY` | _(unset)_               | Sent as a Bearer token                              |
| `NEARDATA_URL`                 | _(from `NETWORK`)_      | Origin or `/v0` URL                                 |
| `NEARDATA_UPSTREAM_API_KEY`    | _(unset)_               | Sent as `apiKey`                                    |
| `CACHE_DIR`                    | `/app/cache`            |                                                     |
| `CACHE_TTL_SECS`               | `3600`                  | Also bounds the follower's history                  |
| `CACHE_MIN_FREE_BYTES`         | `0`                     | Pause cache writes below this free space            |
| `UPSTREAM_TIMEOUT_SECS`        | `10`                    | Keep below the indexers' 30s client timeout         |
| `S3_ENDPOINT`, `S3_BUCKET`, …  | _(unset)_               | Required for the `s3` source                        |

## Deploy

```bash
cd apps/block-proxy
export PROXY_API_KEY='<secret>'
docker compose up -d --build
```

Compose runs mainnet and testnet on host networking, bound to loopback, with
cache and state under `/srv/near/block-proxy`. Put a TLS gateway in front for
public access.

### Node box and k8s

- Node box: `BLOCK_SOURCES=node` with `PROXY_API_KEY`, next to the node.
- k8s proxy: `BLOCK_SOURCES=proxy,neardata`, `BLOCK_PROXY_UPSTREAM_URL` set to
  the node box. The neardata (FastNear) key lives only here.
- Indexers use the k8s proxy.
- API: `RPC_URLS=<node box>/rpc,<FastNear archival>` (client-side failover).

When the node's finalized head is older than `NODE_MAX_LAG_SECS`, `/rpc` and
`/v0/last_block/final` answer 503 (the `/rpc` guard needs the `node` source).
Blocks already published or cached are still served. The k8s proxy and the API
fall back automatically, and the node recovers within one poll of catching up.

## Clients

Indexers using `nb-neardata`:

```bash
NEARDATA_URL=https://proxy.example/v0?api_key=<key>
```

The API and backend can use `https://proxy.example/rpc` as an `RPC_URLS`
endpoint, with the key in `RPC_AUTH_TOKENS`.

Tests: `pnpm --filter block-proxy test`
