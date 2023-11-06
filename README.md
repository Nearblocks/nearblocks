# NearBlocks Near Explorer

[NearBlocks](https://nearblocks.io/) is the leading [Near Blockchain Explorer](https://nearblocks.io), Search, API and Analytics Platform for Near Protocol, a decentralized smart contracts platform. Built and launched in 2022, it is one of the earliest projects built around Near Protocol and its community with the mission of providing equitable access to blockchain data

## Setup

Prerequisites:

- Docker
- Docker Compose

In the root directory, you'll find two essential files: `mainnet.env.example` and `testnet.env.example`. These files define many common environment variables. To configure your environment, simply copy these files:

- Copy `mainnet.env.example` to `mainnet.env` for the Mainnet setup.
- Copy `testnet.env.example` to `testnet.env` for the Testnet setup.

Once your environment is set up, you can launch your application using Docker Compose. Here are the commands for both Mainnet and Testnet:

```
docker compose -f docker-compose.mainnet.yml up -d --build # for Mainnet
docker compose -f docker-compose.testnet.yml up -d --build # for Testnet
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
