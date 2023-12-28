## Backend

Backend contains database migrations, seed files and cron jobs to fetch and analyze statistics

### Config

Update environment variables in `*.backend.env`

```
DATABASE_URL=
REDIS_SENTINEL=
RPC_URL=
RPC_URL2=
NETWORK=
COINGECKO_API_KEY=
COINMARKETCAP_API_KEY=
LIVECOINWATCH_API_KEY=

# Optional
DATABASE_CA=
DATABASE_CERT=
DATABASE_KEY=
REDIS_URL=
SENTRY_DSN=
```

### Migrations

Migrations can be applied by accessing the Docker container and executing the following command

```
cd apps/backend && yarn migrate
```

### Seed

To run all seed files, enter the Docker container and execute the following command:

```
cd apps/backend && yarn seed
```
