## 📚 Indexer Multichain

Multichian indexer works with multichain accounts and transactions

### Config

```
DATABASE_URL=
NETWORK=mainnet

# Optional
DATABASE_CA=
DATABASE_CERT=
DATABASE_KEY=
ARBITRUM_RPC_URL=
ARBITRUM_START_BLOCK=  # 235722005 (mainnet) | 66361040 (testnet)
BASE_RPC_URL=
BASE_START_BLOCK=  # 17538127 (mainnet) | 13048656 (testnet)
BITCOIN_RPC_URL=
BITCOIN_START_BLOCK=  # 853779 (mainnet) | 2869965 (testnet)
BSC_RPC_URL=
BSC_START_BLOCK=  # 40766572 (mainnet) | 42381856 (testnet)
ETHEREUM_RPC_URL=
ETHEREUM_START_BLOCK=  # 20379839 (mainnet) | 6370346 (testnet)
GNOSIS_RPC_URL=
GNOSIS_START_BLOCK=  # 35136644 (mainnet) | 1035904 (testnet)
OPTIMISM_RPC_URL=
OPTIMISM_START_BLOCK=  # 123133412 (mainnet) | 15031530 (testnet)
POLYGON_RPC_URL=
POLYGON_START_BLOCK=  # 59770449 (mainnet) | 9892923 (testnet)
SOLANA_RPC_URL=
SOLANA_START_BLOCK=  # 279492479 (mainnet) | 314013232 (testnet)
SENTRY_DSN=
```

### Supported Contracts

- Mainnet: v1.signer
- Testnet: v1.signer-prod.testnet
