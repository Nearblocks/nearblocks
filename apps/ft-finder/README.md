## 🔎 FT Finder

One-shot batch job that discovers fungible token contracts, infers their on-chain balance storage layout via archival RPC, verifies each candidate against `ft_balance_of`, and seeds `ft_contract_layouts` and `ft_meta` for `indexer-ft-state` to consume.

`RPC_URL` must point at an archival node: both inference and verification read historical heights.

### Config

```
DATABASE_URL_BASE=
DATABASE_URL_CONTRACT=
DATABASE_URL_EVENTS=
NETWORK=mainnet
RPC_URL=

# Optional
DATABASE_CA=
DATABASE_CERT=
DATABASE_KEY=
FT_FINDER_BUCKET_HOURS=1
FT_FINDER_FROM_SCRATCH=false
SENTRY_DSN=
```
