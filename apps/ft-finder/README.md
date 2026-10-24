## 🔎 FT Finder

One-shot batch job that discovers fungible token contracts, infers their on-chain balance storage layout via archival RPC, verifies each candidate against `ft_balance_of`, and seeds `ft_contract_layouts` and `ft_meta` for `indexer-ft-state` to consume.

FT Finder reads historical heights for inference and verification. Configure the
RPC endpoints in priority order, with an archival endpoint after the primary so
historical requests that the primary cannot serve can fail over.

### Config

```
DATABASE_URL_BASE=
DATABASE_URL_CONTRACT=
DATABASE_URL_EVENTS=
NETWORK=mainnet
RPC_URLS=https://proxy.nearblocks.io/mainnet/rpc,https://archival-rpc.mainnet.fastnear.com/?apiKey=YOUR_FASTNEAR_KEY
# Optional: one bearer token per RPC_URLS endpoint, in the same order.
RPC_AUTH_TOKENS=

# Backward-compatible single-endpoint configuration. Used only when RPC_URLS is unset.
RPC_URL=

# Optional
DATABASE_CA=
DATABASE_CERT=
DATABASE_KEY=
FT_FINDER_BUCKET_HOURS=1
FT_FINDER_FROM_SCRATCH=false
SENTRY_DSN=
```
