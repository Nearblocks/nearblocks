# 🚀 NearBlocks Near Explorer 🌐

[NearBlocks](https://nearblocks.io/) is the leading [Near Blockchain Explorer](https://nearblocks.io), 🔍 Search, 🌐API and 📊 Analytics Platform for Near Protocol, a decentralized smart contracts platform. 🌟 Built and launched in 2022, it is one of the earliest projects built around Near Protocol and its community with the mission of providing equitable access to blockchain data

## Setup ⚙️

Prerequisites:

- 🐳 Docker
- 🐳 Docker Compose

In the root directory, you'll find two essential files: `mainnet.env.example` and `testnet.env.example`. These files define many common environment variables. To configure your environment, simply copy these files:

- Copy `mainnet.env.example` to `mainnet.env` for the Mainnet setup.
- Copy `testnet.env.example` to `testnet.env` for the Testnet setup.

Once your environment is set up, you can launch your application using Docker Compose. Here are the commands for both Mainnet and Testnet:

```
docker compose -f docker-compose.mainnet.yml up -d --build # 🚀 for Mainnet
docker compose -f docker-compose.testnet.yml up -d --build # 🧪 for Testnet
```

## Modules 📦

Turborepo 🛠️ is the powerhouse behind our project. Our main modules reside in the 'apps' folder, while shared libraries like 'types' and 'utils' are tucked away in the 'packages' folder. Let's dive into what each module does! 💪

### 🌐 api

The 'api' module serves as the communication bridge, connecting our project with the outside world. 🌍

### 🧩 bos-components

'BOS components' add an extra layer of functionality to 'NearBlock.' Think of them as building blocks for your project's success! 🏗️

### 🌟 explorer-selector

'Explorer-Selector' module is your gateway to the BOS universe. Use it to select your favorite explorer with ease! 🌌

### 📚 indexer-base

The 'Indexer-Base' module is your comprehensive guide to everything related to blockchain data. It indexes blocks, receipts, transactions, accounts, and access keys, making data retrieval a breeze! 📈

### 💰 indexer-balance

'Indexer-Balance' is your trusty companion for tracking account balance changes. Keep a close eye on your finances with this module. 💵

### 📅 indexer-events

'Indexer-Events' is all about indexing ft & nft events. Always keeping an eye on those precious tokens! 🎉

## Contributing 🤝

We welcome contribution to Near Blocks, please see [CONTRIBUTING](CONTRIBUTING.md) for more information.

## License 📜

Near Blocks is licensed under the terms of Business Source License 1.1.

See [LICENSE](LICENCE.md) for details
