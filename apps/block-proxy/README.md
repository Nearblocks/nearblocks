# block-proxy

Caching proxy for finalized NEAR blocks and JSON-RPC. Blocks are read from the
disk cache first, then from the sources in `BLOCK_SOURCES`, in priority order.
Concurrent requests for the same height share one upstream fetch.

## Sources

| Source     | Description                                                                         |
| ---------- | ----------------------------------------------------------------------------------- |
| `node`     | Locally indexed blocks from `NODE_RPC_URL`; history is limited by `CACHE_TTL_SECS`. |
| `proxy`    | Blocks from another block-proxy at `BLOCK_PROXY_UPSTREAM_URL`.                      |
| `neardata` | Blocks from the configured data endpoint.                                           |

The local node source requires `EXPERIMENTAL_indexer_block`. For heights not
held locally, include a remote source after `node`.

## API

| Method | Path                   | Description                                                |
| ------ | ---------------------- | ---------------------------------------------------------- |
| GET    | `/v0/last_block/final` | Redirects to the latest finalized block.                   |
| GET    | `/v0/block/:height`    | Block JSON; `X-Upstream-Source` identifies the source.     |
| POST   | `/rpc`                 | JSON-RPC to `NODE_RPC_URL`, restricted to allowed methods. |
| GET    | `/healthz`, `/readyz`  | Liveness and readiness.                                    |
| GET    | `/metrics`, `/stats`   | Prometheus metrics and JSON stats.                         |

When `PROXY_API_KEY` is set, data routes require it as `?api_key=`, a Bearer
token, or `X-API-Key`.

## Configuration

| Variable                            | Default                 | Notes                                                      |
| ----------------------------------- | ----------------------- | ---------------------------------------------------------- |
| `BLOCK_SOURCES`                     | `neardata`              | Priority list: `node`, `proxy`, and/or `neardata`.         |
| `NETWORK`                           | `mainnet`               | `mainnet` or `testnet`.                                    |
| `PORT` / `ADMIN_PORT`               | `3000` / `3001`         | Data and admin ports.                                      |
| `LISTEN_HOST` / `ADMIN_LISTEN_HOST` | `0.0.0.0`               | Bind addresses; restrict access in the deployment network. |
| `PROXY_API_KEY`                     | _(unset)_               | Optional client key.                                       |
| `NODE_RPC_URL`                      | `http://127.0.0.1:3030` | Node source and `/rpc` endpoint.                           |
| `NODE_RPC_API_KEY`                  | _(unset)_               | Bearer token for `NODE_RPC_URL`.                           |
| `RPC_ALLOWED_METHODS`               | read-only set           | RPC methods forwarded by `/rpc`.                           |
| `INDEXER_STATE_DIR`                 | `/app/state`            | Local indexer checkpoint directory.                        |
| `INDEXER_INTERVAL_MS`               | `250`                   | Finalized-head poll interval.                              |
| `NODE_MAX_LAG_SECS`                 | `10`                    | Maximum age of the node's finalized head.                  |
| `BLOCK_PROXY_UPSTREAM_URL`          | _(unset)_               | Required when `proxy` is in `BLOCK_SOURCES`.               |
| `BLOCK_PROXY_UPSTREAM_API_KEY`      | _(unset)_               | Bearer token for the proxy source.                         |
| `NEARDATA_URL`                      | _(from `NETWORK`)_      | Data endpoint origin or `/v0` URL.                         |
| `NEARDATA_UPSTREAM_API_KEY`         | _(unset)_               | API key for the data endpoint.                             |
| `CACHE_DIR`                         | `/app/cache`            | Block cache directory.                                     |
| `CACHE_TTL_SECS`                    | `3600`                  | Cache lifetime and local history window.                   |
| `SHADOW_SOURCE`                     | _(unset)_               | Optional source for background block comparisons.          |
| `SHADOW_SAMPLE_RATE`                | `0.1`                   | Fraction of eligible comparisons, `(0, 1]`.                |
| `UPSTREAM_TIMEOUT_SECS`             | `13`                    | Timeout for upstream requests.                             |

## Build

Build from the monorepo root with the root `Dockerfile` and `APP=block-proxy`.

Tests: `pnpm --filter block-proxy test`
