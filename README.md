# NearBlocks Near Explorer

[NearBlocks](https://nearblocks.io/) is the leading [Near Blockchain Explorer](https://nearblocks.io), Search, API and Analytics Platform for Near Protocol, a decentralized smart contracts platform. Built and launched in 2022, it is one of the earliest projects built around Near Protocol and its community with the mission of providing equitable access to blockchain data

## Setup

Prerequisites:

- Docker
- Docker Compose

In the root directory, you'll find these essential files: `mainnet.aggregates.env.example`, `mainnet.api.env.example`, `mainnet.backend.env.example`, `mainnet.indexer.env.example` for Mainnet, and `testnet.aggregates.env.example`, `testnet.api.env.example`, `testnet.backend.env.example`, `testnet.indexer.env.example` for Testnet. These files define many common environment variables. To configure your environment, simply copy these files:

- For the Mainnet setup:
  - Copy `mainnet.aggregates.env.example` to `mainnet.aggregates.env`
  - Copy `mainnet.api.env.example` to `mainnet.api.env`
  - Copy `mainnet.backend.env.example` to `mainnet.backend.env`
  - Copy `mainnet.indexer.env.example` to `mainnet.indexer.env`
- For the Testnet setup:
  - Copy `testnet.aggregates.env.example` to `testnet.aggregates.env`
  - Copy `testnet.api.env.example` to `testnet.api.env`
  - Copy `testnet.backend.env.example` to `testnet.backend.env`
  - Copy `testnet.indexer.env.example` to `testnet.indexer.env`

Once your environment is set up, you can launch your application using Docker Compose. Here are the commands for both Mainnet and Testnet:

```
# For Mainnet
docker compose -f mainnet-aggregates.yml -f mainnet-api.yml -f mainnet-app-lite.yml -f mainnet-app.yml -f mainnet-backend.yml -f mainnet-explorer-selector.yml -f mainnet-indexer.yml up -d --build

# For Testnet
docker compose -f testnet-aggregates.yml -f testnet-api.yml -f testnet-app-lite.yml -f testnet-app.yml -f testnet-backend.yml -f testnet-explorer-selector.yml -f testnet-indexer.yml up -d --build
```

## Modules

Turborepo is used as the build system for our project. Our main modules reside in the 'apps' folder, while shared libraries like 'types' and 'utils' are in the 'packages' folder

- api: standalone server which serves the indexed data
- backend: contains database migrations and cron jobs to fetch and generate stats
- bos-components: our components built on BOS
- explorer-selector: BOS gateway for selecting your favourite explorer (Nearblocks)
- indexer-base: our indexer built using near lake to index blocks, receipts, transactions, accounts and access keys for storing in timescale
- indexer-balance: secondary indexer for tracking timeseries account balances
- indexer-events: secondary indexer for tracking timeseries FT and NFT events

## Contributing

We welcome contribution to NearBlocks, please see [CONTRIBUTING](CONTRIBUTING.md) for more information.

## License

NearBlocks is licensed under the terms of Business Source License 1.1.

See [LICENSE](LICENCE.md) for details
