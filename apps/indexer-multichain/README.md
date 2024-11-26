## 📚 Indexer Multichain

Multichian indexer works with multichain accounts and transactions

### Config

```
DATABASE_URL=
REDIS_SENTINEL_NAME=
REDIS_SENTINEL_URLS=
REDIS_PASSWORD=
NETWORK=mainnet
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
FASTNEAR_ENDPOINT=

# Optional
DATABASE_CA=
DATABASE_CERT=
DATABASE_KEY=
REDIS_URL=
MULTICHAIN_START_BLOCK=
MULTICHAIN_DATA_SOURCE=   # NEAR_LAKE | FAST_NEAR
SENTRY_DSN=
```

### Supported Contracts

- Mainnet: v1.signer
- Testnet: v1.signer-prod.testnet

### Supported Networks

- Bitcoin
- Ethereum
