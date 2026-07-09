# Migrating to NearBlocks API v3

This guide covers migrating from API v1 (`/v1/*`) and v2 (`/v2/*`) to v3 (`/v3/*`).

v3 is a full redesign of the API surface. The three biggest changes:

1. **New pagination model** — opaque, bidirectional cursors (`next` / `prev`) replace `page` / `per_page` and raw-value cursors.
2. **Standard response envelope** — every response is `{ "data": ..., "meta": ... }` instead of domain-keyed wrappers like `{ "txns": [...] }`.
3. **Expanded surface** — new endpoint families for multi-tokens (NEP-245), intents, account/token analytics, and multichain signatures.

Authentication is unchanged: pass your API key as a bearer token (`Authorization: Bearer <key>`).

---

## 1. Breaking changes at a glance

| Area              | v1 / v2                                                                            | v3                                                                              |
| ----------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Pagination params | `page`, `per_page`, `order`, `cursor` (raw value)                                  | `next`, `prev` (opaque cursors), `limit`                                        |
| Cursor format     | Raw column value (numeric `id`, `event_index`, `block_height`)                     | Opaque base64 string — do not construct or parse                                |
| Page jumping      | `page=5` supported                                                                 | Not supported — cursor walking only                                             |
| Response shape    | `{ "txns": [...], "cursor": "..." }`, `{ "blocks": [...] }`, `{ "tokens": [...] }` | `{ "data": [...], "meta": { "next_page", "prev_page" } }`                       |
| Errors            | Varied                                                                             | `{ "data": null, "errors": [{ "message", "path" }] }`                           |
| Count endpoints   | Public, `{ "txns": [{ "count": 12345 }] }`                                         | Mostly internal-only; where public, counts are capped strings (e.g. `"10000+"`) |
| Date filtering    | `after_date` / `before_date` (v1), `after_timestamp` / `before_timestamp` (v2)     | `before_ts` (19-digit nanosecond timestamp)                                     |
| Txn filters       | `from` / `to`                                                                      | `signer` / `receiver`                                                           |
| Sort params       | `sort` + `order` on token lists                                                    | Handled by cursor; reduced explicit sort options                                |

---

## 2. Pagination migration

### Before (v1/v2)

Two styles existed:

```
GET /v1/txns?page=2&per_page=25&order=desc
GET /v1/account/alice.near/ft-txns?cursor=00000012345678900000000000000000001&per_page=25
```

Response carried the next cursor at the top level, next to the data array:

```json
{
  "cursor": "10614059",
  "txns": [ ... ]
}
```

The cursor was a raw database value (row id, event index, or block height). Some clients constructed these manually — that no longer works in v3.

### After (v3)

Every paginated v3 endpoint accepts:

| Param       | Type    | Notes                                                                   |
| ----------- | ------- | ----------------------------------------------------------------------- |
| `limit`     | integer | 1–100, default 25                                                       |
| `next`      | string  | Opaque cursor from `meta.next_page` — fetches the next (older) page     |
| `prev`      | string  | Opaque cursor from `meta.prev_page` — fetches the previous (newer) page |
| `before_ts` | string  | Optional. 19-digit nanosecond timestamp; only rows before this time     |

```
GET /v3/txns?limit=25
GET /v3/txns?limit=25&next=eyJ0aW1lc3RhbXAiOiIxNz...
```

Cursors come back in the `meta` object:

```json
{
  "data": [ ... ],
  "meta": {
    "next_page": "eyJ0aW1lc3RhbXAiOiIxNz...",
    "prev_page": "eyJ0aW1lc3RhbXAiOiIxNz..."
  }
}
```

Rules:

- **Cursors are opaque.** Treat them as tokens. Their internal format may change without notice.
- A missing `meta.next_page` means you reached the last page.
- `prev` lets you page backwards — new in v3 (v1/v2 cursors were forward-only).
- There is no offset/page-number access. To start from a point in time, use `before_ts`.
- Lists are ordered newest-first by default.

### Migration checklist

- Replace `page`/`per_page` with `limit` + cursor walking.
- Replace stored raw cursors (`id`, `event_index`) with the opaque `next_page` value.
- Replace `after_date`/`before_date` filtering with `before_ts` (nanoseconds).
- Stop parsing or constructing cursor values.

---

## 3. Response envelope

All v3 responses use one envelope:

```json
{
  "data": <object or array or null>,
  "errors": [ { "message": "...", "path": "..." } ],   // present on failure
  "meta": { "next_page": "...", "prev_page": "..." }    // present on paginated lists
}
```

Migration: replace every domain-specific key (`txns`, `blocks`, `tokens`, `holders`, `keys`, ...) with `data`.

| v1/v2 response                       | v3 response                                                          |
| ------------------------------------ | -------------------------------------------------------------------- |
| `{ "txns": [...], "cursor": "..." }` | `{ "data": [...], "meta": {...} }`                                   |
| `{ "blocks": [...] }`                | `{ "data": [...] }`                                                  |
| `{ "tokens": [...] }`                | `{ "data": [...] }`                                                  |
| `{ "account": [...] }`               | `{ "data": {...} }` (single objects are no longer wrapped in arrays) |

### Count endpoints

Most `/count` endpoints are **internal-only in v3** and return `404`/`403` for public keys. Where counts are exposed, they return a single object with a **string** count that may be capped:

```json
{ "data": { "count": "10000+" } }
```

If you relied on exact large counts, adjust parsing to accept the `+` suffix.

---

## 4. Renamed and restructured fields

v3 normalizes response shapes across all domains. Changes by domain:

### Transactions (`/v3/txns`, `/v3/accounts/{account}/txns`)

| v1/v2 field                         | v3                                                                                                                        |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `id`                                | Removed (was the pagination key; use cursors)                                                                             |
| `included_in_block_hash`            | Removed — use nested `block.block_hash`                                                                                   |
| `block: { block_height }`           | Expanded: `block: { block_hash, block_height, block_timestamp }`                                                          |
| `actions[].args` (list items)       | List items return `actions[{ action, method }]` only; full `args` + `rlp_hash` on the detail endpoint (`/v3/txns/{hash}`) |
| `actions_agg: { deposit }`          | `actions_agg: { deposit, gas_attached }`                                                                                  |
| `outcomes: { status }`              | `outcomes: { status, status_key }` — `status` boolean plus `status_key` enum (e.g. `SUCCESS_VALUE`, `FAILURE`)            |
| `outcomes_agg: { transaction_fee }` | `outcomes_agg: { gas_used, transaction_fee }`                                                                             |
| —                                   | Added: `shard_id`, `index_in_chunk`, `receipt_conversion_gas_burnt`, `receipt_conversion_tokens_burnt`                    |

Query param renames: `from` → `signer`, `to` → `receiver`.

### Receipts (`/v3/txns/{hash}/receipts`, `/v3/accounts/{account}/receipts`)

Receipts are returned as a recursive tree: `{ receipt_id, predecessor_account_id, receiver_account_id, public_key, actions[], outcome { executor_account_id, gas_burnt, tokens_burnt, logs, result, status, status_key }, block, receipts[] }`. The `outcome.status` boolean + `status_key` enum split applies here too.

### Blocks (`/v3/blocks`)

Same aggregate structure as before (`chunks_agg`, `transactions_agg`), with `receipts_agg` on the detail endpoint. Numeric values (heights, gas) are returned as strings.

### Token transfer events (ft-txns, nft-txns, mt-txns)

| v1/v2 field                          | v3                                                                              |
| ------------------------------------ | ------------------------------------------------------------------------------- |
| `ft` / `nft` (token metadata object) | `meta` (contract metadata); NFT/MT token detail adds `token_meta` / `base_meta` |
| `included_in_block_hash`             | Removed — use nested `block` object                                             |
| —                                    | Added: `contract_account_id`, `shard_id`, `receipt_id`, `event_type` (FT)       |

Core event fields are unchanged: `affected_account_id`, `involved_account_id`, `delta_amount`, `cause`, `event_index`.

### Contracts (`/v3/accounts/{account}/contract`)

Adds `global_account_id` and `global_code_hash` (global contracts support).

### Token lists (`/v3/fts`, `/v3/nfts`)

Field names now carry explicit periods: `change_24h`, `volume_24h`. FT list items: `contract, name, symbol, decimals, icon, reference, price, change_24h, market_cap, onchain_market_cap, total_supply, volume_24h, holders, transfers`.

---

## 5. Endpoint mapping

`{account}`, `{contract}`, `{token}`, `{hash}`, `{key}` are path parameters. **[internal]** = not available to public API keys in v3.

### Transactions

| v1 / v2                        | v3                                                                      |
| ------------------------------ | ----------------------------------------------------------------------- |
| `GET /v1/txns`                 | `GET /v3/txns`                                                          |
| `GET /v1/txns/count`           | `GET /v3/txns/count` [internal]                                         |
| `GET /v1/txns/latest`          | `GET /v3/txns/latest`                                                   |
| `GET /v1/txns/{hash}`          | `GET /v3/txns/{hash}`                                                   |
| `GET /v1/txns/{hash}/full`     | `GET /v3/txns/{hash}` + `GET /v3/txns/{hash}/receipts`                  |
| `GET /v2/txns/{hash}`          | `GET /v3/txns/{hash}`                                                   |
| `GET /v2/txns/{hash}/receipts` | `GET /v3/txns/{hash}/receipts`                                          |
| —                              | `GET /v3/txns/stats` (new — 24h txn stats)                              |
| —                              | `GET /v3/txns/{hash}/fts`, `/nfts`, `/mts` (new — token events per txn) |

### Blocks

| v1                      | v3                                |
| ----------------------- | --------------------------------- |
| `GET /v1/blocks`        | `GET /v3/blocks`                  |
| `GET /v1/blocks/count`  | `GET /v3/blocks/count` [internal] |
| `GET /v1/blocks/latest` | `GET /v3/blocks/latest`           |
| `GET /v1/blocks/{hash}` | `GET /v3/blocks/{hash}`           |
| —                       | `GET /v3/blocks/stats` (new)      |

### Accounts

| v1 / v2                                                    | v3                                                                                                                                                                        |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /v1/account/{account}`                                | `GET /v3/accounts/{account}` + `GET /v3/accounts/{account}/balance` (balance split out)                                                                                   |
| `GET /v1/account/{account}/contract`                       | `GET /v3/accounts/{account}/contract`                                                                                                                                     |
| `GET /v1/account/{account}/contract/deployments`           | `GET /v3/accounts/{account}/contract/deployments`                                                                                                                         |
| `GET /v1/account/{account}/contract/parse`                 | `GET /v3/accounts/{account}/contract/schema`                                                                                                                              |
| `GET /v1/account/{account}/contract/{method}`              | `GET /v3/accounts/{account}/contract/{method}/action`                                                                                                                     |
| `GET /v1/account/{account}/inventory`                      | `GET /v3/accounts/{account}/assets/fts` + `/assets/nfts` (split, paginated)                                                                                               |
| `GET /v1/account/{account}/tokens`                         | `GET /v3/accounts/{account}/assets/fts`                                                                                                                                   |
| `GET /v2/account/{account}/inventory/mts`                  | `GET /v3/accounts/{account}/assets/mts/fts` + `/assets/mts/nfts`                                                                                                          |
| `GET /v1/account/{account}/keys`                           | `GET /v3/accounts/{account}/keys`                                                                                                                                         |
| `GET /v1/account/{account}/keys/count`                     | `GET /v3/accounts/{account}/keys/count` [internal]                                                                                                                        |
| `GET /v1/account/{account}/txns`                           | `GET /v3/accounts/{account}/txns`                                                                                                                                         |
| `GET /v1/account/{account}/txns-only`                      | `GET /v3/accounts/{account}/txns`                                                                                                                                         |
| `GET /v1/account/{account}/txns/count`, `/txns-only/count` | `GET /v3/accounts/{account}/txns/count` [internal]                                                                                                                        |
| `GET /v1/account/{account}/receipts`                       | `GET /v3/accounts/{account}/receipts`                                                                                                                                     |
| `GET /v2/account/{account}/receipts`                       | `GET /v3/accounts/{account}/receipts`                                                                                                                                     |
| `GET /v1/account/{account}/ft-txns`                        | `GET /v3/accounts/{account}/ft-txns`                                                                                                                                      |
| `GET /v1/account/{account}/nft-txns`                       | `GET /v3/accounts/{account}/nft-txns`                                                                                                                                     |
| `GET /v1/account/{account}/stake-txns`                     | `GET /v3/accounts/{account}/staking-txns` (renamed)                                                                                                                       |
| `GET /v1/account/{account}/activities`                     | Removed — see `/v3/accounts/{account}/stats/*` for balance history                                                                                                        |
| `GET /v1/analytics/{account}/balance`                      | `GET /v3/accounts/{account}/stats/balance`                                                                                                                                |
| —                                                          | `GET /v3/accounts/{account}/mt-txns` (new — multi-token transfers)                                                                                                        |
| —                                                          | `GET /v3/accounts/{account}/stats`, `/stats/heatmap`, `/stats/txns`, `/stats/balance`, `/stats/near`, `/stats/fts`, `/stats/nfts`, `/stats/mts` (new — account analytics) |

All account `*/count` companions are internal-only in v3.

### Fungible tokens

| v1                               | v3                                                                                                                                  |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `GET /v1/fts`                    | `GET /v3/fts`                                                                                                                       |
| `GET /v1/fts/count`              | `GET /v3/fts/count` [internal]                                                                                                      |
| `GET /v1/fts/txns`               | `GET /v3/fts/txns`                                                                                                                  |
| `GET /v1/fts/{contract}`         | `GET /v3/fts/{contract}`                                                                                                            |
| `GET /v1/fts/{contract}/txns`    | `GET /v3/fts/{contract}/txns`                                                                                                       |
| `GET /v1/fts/{contract}/holders` | `GET /v3/fts/{contract}/holders`                                                                                                    |
| —                                | `GET /v3/fts/{contract}/stats/overview`, `/stats/heatmap`, `/stats/transfers`, `/stats/{account}/transfers` (new — token analytics) |

### Non-fungible tokens

| v1                                            | v3                                            |
| --------------------------------------------- | --------------------------------------------- |
| `GET /v1/nfts`                                | `GET /v3/nfts`                                |
| `GET /v1/nfts/txns`                           | `GET /v3/nfts/txns`                           |
| `GET /v1/nfts/{contract}`                     | `GET /v3/nfts/{contract}`                     |
| `GET /v1/nfts/{contract}/txns`                | `GET /v3/nfts/{contract}/txns`                |
| `GET /v1/nfts/{contract}/holders`             | `GET /v3/nfts/{contract}/holders`             |
| `GET /v1/nfts/{contract}/tokens`              | `GET /v3/nfts/{contract}/tokens`              |
| `GET /v1/nfts/{contract}/tokens/{token}`      | `GET /v3/nfts/{contract}/tokens/{token}`      |
| `GET /v1/nfts/{contract}/tokens/{token}/txns` | `GET /v3/nfts/{contract}/tokens/{token}/txns` |

All NFT `*/count` companions are internal-only in v3.

### Multi-tokens (NEP-245) — new domain

v2 exposed only `GET /v2/mts/contract/{contract}/{token_id}` (metadata). v3 adds a full family:

- `GET /v3/mts` — list MT contracts
- `GET /v3/mts/txns` — all MT transfers
- `GET /v3/mts/{contract}/txns`
- `GET /v3/mts/{contract}/tokens`
- `GET /v3/mts/{contract}/tokens/{token}` — replaces `/v2/mts/contract/{contract}/{token_id}`
- `GET /v3/mts/{contract}/tokens/{token}/txns`, `/holders`
- `GET /v3/mts/{contract}/tokens/{token}/stats/overview`, `/stats/heatmap`, `/stats/transfers`, `/stats/{account}/transfers`

### Keys

| v1                   | v3                   |
| -------------------- | -------------------- |
| `GET /v1/keys/{key}` | `GET /v3/keys/{key}` |

### Search

| v1                        | v3                                                                                |
| ------------------------- | --------------------------------------------------------------------------------- |
| `GET /v1/search`          | `GET /v3/search`                                                                  |
| `GET /v1/search/txns`     | `GET /v3/search/txns`                                                             |
| `GET /v1/search/blocks`   | `GET /v3/search/blocks`                                                           |
| `GET /v1/search/accounts` | `GET /v3/search/accounts`                                                         |
| `GET /v1/search/receipts` | `GET /v3/search/receipts`                                                         |
| `GET /v1/search/tokens`   | `GET /v3/search/fts` + `/v3/search/nfts` + `/v3/search/mts` (split by token type) |
| —                         | `GET /v3/search/keys` (new)                                                       |

### Charts and stats

| v1                                         | v3                                                                            |
| ------------------------------------------ | ----------------------------------------------------------------------------- |
| `GET /v1/stats`                            | `GET /v3/stats`                                                               |
| `GET /v1/stats/price`                      | `GET /v3/price-stats`                                                         |
| `GET /v1/charts` / `GET /v1/charts/latest` | `GET /v3/block-stats`, `/v3/txn-stats`, `/v3/address-stats` (split by metric) |
| `GET /v1/charts/tps`                       | `GET /v3/tps-stats`                                                           |
| —                                          | `GET /v3/signer-stats`, `/v3/signer-stats/total` (new)                        |

### Validators / staking

| v1                   | v3                                                      |
| -------------------- | ------------------------------------------------------- |
| `GET /v1/validators` | `GET /v3/validators`                                    |
| —                    | `GET /v3/validators/info` (new)                         |
| —                    | `GET /v3/staking-txns` (new — global staking transfers) |

### Chain abstraction → multichain

| v1                                                         | v3                                                                                               |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `GET /v1/chain-abstraction/txns`                           | `GET /v3/multichain/signatures`                                                                  |
| `GET /v1/chain-abstraction/{account}/txns`                 | `GET /v3/multichain/signatures?account={account}` (also filterable by `address`, `chain`, `txn`) |
| `GET /v1/chain-abstraction/{account}/multi-chain-accounts` | See `/v3/multichain/signatures` response (`dest_address`, `dest_chain`)                          |
| —                                                          | `GET /v3/multichain/mpcs` (new — MPC network info)                                               |
| —                                                          | `GET /v3/multichain/signatures/stats` (new)                                                      |

### Intents — new domain

- `GET /v3/intents/txns` — intents transfer events (public)
- `GET /v3/intents/txns/count` — public count

### Sync status

| v1                                    | v3                                                                                                                                              |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /v1/sync/status`                 | Removed — use per-indexer endpoints below                                                                                                       |
| `GET /v1/sync/status/ft-holders`      | `GET /v3/sync/status/ft-holders`                                                                                                                |
| `GET /v1/sync/status/nft-holders`     | `GET /v3/sync/status/nft-holders`                                                                                                               |
| `GET /v1/sync/status/indexer-balance` | `GET /v3/sync/status/indexer-balance`                                                                                                           |
| `GET /v1/sync/status/indexer-base`    | `GET /v3/sync/status/indexer-base`                                                                                                              |
| `GET /v1/sync/status/indexer-events`  | `GET /v3/sync/status/indexer-events`                                                                                                            |
| `GET /v1/sync/status/daily-stats`     | `GET /v3/sync/status/daily-stats`                                                                                                               |
| —                                     | `GET /v3/sync/status/mt-holders`, `/indexer-receipts`, `/indexer-accounts`, `/indexer-contract`, `/indexer-signature`, `/indexer-staking` (new) |

---

## 6. Endpoints with no v3 equivalent

These remain available on v1 only. Plan around them — they will not be carried into v3:

- `GET /v1/account/{account}/activities` — use `/v3/accounts/{account}/stats/*` instead
- `GET /v1/account/{account}/txns-only` — merged into `/v3/accounts/{account}/txns`
- `GET /v1/accounts/eth` — ETH-implicit account listing
- `GET /v1/kitwallet/*` — kitwallet compatibility endpoints
- `GET /v1/legacy/*` — legacy supply/fees endpoints
- `GET /v1/campaigns/*` — ads/campaigns
- `GET /v1/health/*` — use `/v3/sync/status/*`

---

## 7. Worked examples

### Paginating account transactions

Before:

```bash
curl -H "Authorization: Bearer $KEY" \
  "https://api.nearblocks.io/v1/account/alice.near/txns?per_page=25&order=desc"
# → { "cursor": "10614059", "txns": [...] }

curl -H "Authorization: Bearer $KEY" \
  "https://api.nearblocks.io/v1/account/alice.near/txns?per_page=25&cursor=10614059"
```

After:

```bash
curl -H "Authorization: Bearer $KEY" \
  "https://api.nearblocks.io/v3/accounts/alice.near/txns?limit=25"
# → { "data": [...], "meta": { "next_page": "eyJ0aW1lc3RhbXAiOi..." } }

curl -H "Authorization: Bearer $KEY" \
  "https://api.nearblocks.io/v3/accounts/alice.near/txns?limit=25&next=eyJ0aW1lc3RhbXAiOi..."
```

### Filtering transactions by counterparty

Before: `/v1/account/alice.near/txns?from=bob.near`
After: `/v3/accounts/alice.near/txns?signer=bob.near` (`from` → `signer`, `to` → `receiver`)

### Reading transaction status

Before:

```json
{ "outcomes": { "status": true } }
```

After — `status` remains a boolean; `status_key` gives the precise outcome:

```json
{ "outcomes": { "status": true, "status_key": "SUCCESS_VALUE" } }
```

### FT transfers for an account

Before: `/v1/account/alice.near/ft-txns?per_page=25` → items include token metadata under `ft`.
After: `/v3/accounts/alice.near/ft-txns?limit=25` → metadata under `meta`; items add `contract_account_id`, `event_type`, `receipt_id`, `shard_id`; block context under nested `block`.

---

## 8. Migration checklist

1. Change base path `/v1` (or `/v2`) → `/v3`; apply path renames from section 5 (`/account/` → `/accounts/`, `stake-txns` → `staking-txns`, `chain-abstraction` → `multichain`).
2. Unwrap responses from `data` instead of `txns`/`blocks`/`tokens`/etc.
3. Switch pagination to `limit` + `next`/`prev` cursor walking; drop `page`, `per_page`, `order`.
4. Stop constructing cursors; store `meta.next_page` verbatim if you resume pagination later.
5. Rename query params: `from`/`to` → `signer`/`receiver`; date ranges → `before_ts` (nanoseconds).
6. Update field access: nested `block{}` object, `meta` for token metadata, `status_key` for outcome detail.
7. Remove dependence on public `/count` endpoints; where still available, parse counts as strings with a possible `+` suffix.
8. If you use DEX, activities, kitwallet, or legacy endpoints, keep those on v1 and plan alternatives.
