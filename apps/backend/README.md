## Backend

Backend contains cron jobs to fetch and analyze statistics

### Config

Update environment variables in `*.backend.env`

```
DB_URL_BASE=
DB_URL_CONTRACTS=
DB_URL_EVENTS=
NETWORK=
COINGECKO_API_KEY=
COINMARKETCAP_API_KEY=
RPC_URL=
ARCHIVAL_RPC_URL=

# Optional
RPC_AUTH_TOKENS=
FASTNEAR_API_KEY=
DATABASE_CA=
DATABASE_CERT=
DATABASE_KEY=
SENTRY_DSN=
```

`RPC_URL` takes one endpoint or a comma-separated list in priority order, with
matching `RPC_AUTH_TOKENS`. Later endpoints are used when an earlier one fails
or cannot serve the request. `RPC_URL` need not be archival: NFT metadata that
needs old heights is retried through `ARCHIVAL_RPC_URL`. The hourly `rpc_calls`
log shows calls per endpoint.
