## 🪙 Indexer FT State

Decodes fungible token balances directly from contract state changes into `ft_state_balances`, using a static layout table for the handful of non-standard contracts and structural detection, gated on nep141 events or `ft_transfer` receipts, for everything else.

The `settings` cursor key is fixed at `ft_state`; `aggregates` reads the same key to roll balances into `ft_state_holders`.

### Config

```
DATABASE_URL=
NETWORK=mainnet

# Optional
DATABASE_CA=
DATABASE_CERT=
DATABASE_KEY=
FASTNEAR_API_KEY=
NEARDATA_CONCURRENCY=auto
NEARDATA_URL=
SENTRY_DSN=
```
