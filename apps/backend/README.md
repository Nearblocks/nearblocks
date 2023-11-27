## 💡 Backend

Backend contains database migrations 📦 and cron jobs 🕒 to fetch and analyze statistics 📊

### Config

```
DATABASE_URL=
RPC_URL=
NETWORK=
COINGECKO_API_KEY=
COINMARKETCAP_API_KEY=
LIVECOINWATCH_API_KEY=

# Optional
DATABASE_CA=
DATABASE_CERT=
DATABASE_KEY=
SENTRY_DSN=
```

### Migrations

Migrations 📦 can be applied by accessing the Docker container 🐳 and executing the following command

```
cd apps/backend && yarn migrate
```
