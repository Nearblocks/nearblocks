## Backend

Backend contains cron jobs to fetch and analyze statistics

### Config

Update environment variables in `*.backend.env`

```
DB_URL_BASE=
DB_URL_CONTRACTS=
DB_URL_EVENTS=
RPC_URL=          # or RPC_URLS, below
NETWORK=

# Optional
RPC_URLS=         # comma-separated, in priority order
RPC_AUTH_TOKENS=  # Bearer tokens matching RPC_URLS
DATABASE_CA=
DATABASE_CERT=
DATABASE_KEY=
SENTRY_DSN=
```

Later `RPC_URLS` entries are used only when an earlier one is unreachable or
returns 408, 429 or 5xx.
