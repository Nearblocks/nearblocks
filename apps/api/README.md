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
RPC_URL=
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

`RPC_URLS` lists RPC endpoints in priority order (for example the block proxy's
`/rpc`, then FastNear); `RPC_AUTH_TOKENS` holds matching Bearer tokens, with an
empty entry for none. Later endpoints are used only when an earlier one is
unreachable or returns 408, 429 or 5xx. `RPC_URL` still works for one endpoint.
