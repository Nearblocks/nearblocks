## API

Standalone server which serves the indexed data

### Config

Update environment variables in `*.api.env`

```
DB_URL_BASE=
DB_URL_BALANCE=
DB_URL_CONTRACT=
DB_URL_EVENTS=
DB_URL_MULTICHAIN=
DB_URL_STAKING=
DB_URL_USER=
DB_WRITE_URL_BASE=
REDIS_SENTINEL_NAME=
REDIS_SENTINEL_URLS=
REDIS_PASSWORD=
RPC_URLS=
RPC_AUTH_TOKENS=
NETWORK=
MAINNET_URL=
TESTNET_URL=

# Optional
DATABASE_CA=
DATABASE_CERT=
DATABASE_KEY=
REDIS_URL=
SENTRY_DSN=
```

`RPC_URLS` lists endpoints in priority order, with matching `RPC_AUTH_TOKENS`
(`RPC_URL` is deprecated). Later endpoints are used when an earlier one fails
or cannot serve the request. No endpoint needs to be archival.

The internal `GET /metrics` endpoint exports RPC request counters, latency
histograms and fallbacks by reason. Endpoints are labelled `primary` and
`fallback_N`; URLs and credentials are never exported.
