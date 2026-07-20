# v1/v2 → v3 Back-Compat Proxy

When an instance runs with `V1_PROXY_ENABLED=true`, every legacy v1/v2 endpoint is
served by reshaping a **v3 query** into the legacy wire format — the old v1 SQL is never
run. Each endpoint is either **Supported** (proxied over v3) or **Not supported**
(returns `410 Gone`). With the flag **off**, every legacy handler is wired exactly as
before and nothing here applies.

The proxy only makes sense with `DB_URL_*` pointed at the **split DBs**: a proxied
handler runs v3 queries against v3-only tables (`ft_account_stats`, typed
`staking_events`, …) that the legacy DB does not have.

| | Flag off | Flag on |
|---|---|---|
| `DB_URL_*` → legacy DB | production today — everything works | broken: proxied handlers query v3-only tables |
| `DB_URL_*` → split DBs | broken: legacy cross-DB JOINs fail | the intended end state |

## Verification status

Most rows below were derived by reading the legacy SQL against the v3 queries. A subset
was cross-checked against production (`api.nearblocks.io`, where the v1/v3 split is already
live by ingress):

| Claim | Result |
|---|---|
| v1 still on the legacy DB, v3 on the split DBs | **Confirmed** — v1 returns deleted access keys and both sides of a transfer; v3 returns neither. |
| `/v3/accounts/{a}/contract/{method}/action` ignores the account | **Confirmed** — different accounts return byte-identical args (v3 defect, see below). |
| Token-transfer lists lose the debit side | **Confirmed** — v3 keeps only the crediting row; lists and counts roughly halve. |
| v1 `/keys/{key}` includes deleted keys | **Confirmed** — v3 filters them out. |
| `receipts[]` shrinks vs v1 | **Not reproduced** on the sampled txn — real in principle, not observed. |
| v1 count rows carry an extra `cost` key | **Confirmed** — dropped by the proxy. |
| `actions[].args` and `shard_id` shapes | **Corrected against production** — see txn-detail section. |

## Contract-wide changes (every proxied list endpoint)

These follow from v3's pagination model and apply everywhere:

| Change | Old | New |
|---|---|---|
| `page=N` | offset paging, jump to any page | **422** (only `page=1`/default is served) |
| `order=asc` | supported | **422** (v3 is newest-first only) |
| `per_page` | up to 250 | capped at **100** (`Math.min`), no error |
| `cursor` | raw column value clients could construct/persist | v3 **opaque base64** token; a numeric cursor is **422** |
| `after_date` / `after_timestamp` / `after_block` | lower-bound filter | **422** (v3 exposes only an upper bound) |
| per-row `id` | present | `null` (column absent from the split schema) |

The 422s are deliberate: v3 cannot express these, and answering with an unfiltered or
first-page result would be a silently wrong answer.

## Supported (proxied over v3)

Non-1:1 notes call out where the v1 shape can't be fully reproduced.

### Blocks
- `GET /v1/blocks` — §contract-wide; `receipts_agg.count` is always `0` (not in the v3 list query); height paging becomes timestamp paging.
- `GET /v1/blocks/{hash}` — faithful; `chunks_agg.count` renamed back to `shards`; gas coerced string→number.
- `GET /v1/blocks/latest` — faithful (`gas_used` coerced to number).
- `GET /v1/blocks/count` — v3 approximate count, cap stripped to a number (different source than v1).

### Transactions
- `GET /v1/txns` — §contract-wide; **`from`/`to`/`action`/`method` → 422** (no v3 expression); `before_date` honoured; per-action `args` → `null`.
- `GET /v1/txns/count` — same filter rejections; capped at 10 000.
- `GET /v1/txns/latest` — faithful (`deposit` coerced to number; shares the v3 5s redis cache).
- `GET /v1/txns/{hash}`, `/{hash}/full`, `GET /v2/txns/{hash}` — assembled from the v3 txn row + recursive receipt tree + per-receipt ft/nft events. Only **ACTION** receipts, depth-first; `receipt_kind` is the constant `'ACTION'`; events on un-synced contracts disappear; `event_index` → `null`; `shard_id` emitted as a **string** to match production. `args` matches v1's `args_json` string / v2's stringified object exactly.
- `GET /v2/txns/{hash}/receipts` — thin envelope wrap around the v3 receipt tree.

### Search — `services/proxy/search.ts`
v3 classifies the keyword before querying, so a keyword that fails the classifier returns
`[]` without touching the DB, and lookups are bounded by the rolling window.
- `/v1/search/txns` — keyword must be 43–44-char base58 or `0x`+64 hex; else `[]`.
- `/v1/search/blocks` — heights above 1e12 and malformed hashes → `[]`.
- `/v1/search/receipts` — `transaction_hash` renamed back to `originated_from_transaction_hash`.
- `/v1/search/accounts` — v3 fuzzy top-5 filtered back to an **exact** match (v1's 0/1-row contract).
- `/v1/search/tokens` — v3 requires synced metadata, so un-synced FT contracts no longer match.
- `/v1/search` (combined) — emits exactly the v1 key set; `mtTokens` changes source from a live RPC call to the indexed `mt_list` table.

### Keys
- `GET /v1/keys/{key}` — **deleted keys no longer appear** (v3 filters them); the `deleted` object stays but is null-valued; walks v3's keyset cursor, capped at 1000 keys; `block_timestamp` coerced to number.

### Kitwallet
- `stakingPools`, `publicKey/{key}/accounts`, `likelyNFTs`, `likelyNFTsFromBlock` — faithful.
- `staking-deposits/{account}` — **different source** (typed `staking_events` vs the old `LIKE` heuristic); amounts can differ; ordered by validator.
- `likelyTokens`, `likelyTokensFromBlock` — **different source** (`ft_account_stats` + last 2 days of `ft_events`); historically-touched contracts may drop out.
- The remaining 4 kitwallet endpoints are **not supported** (see below).

### Accounts
- `GET /v1/account/{a}` — `locked` is the **staked amount**, not v3's boolean; missing keys emitted as `null`.
- `.../contract` — RPC `view_code`, byte-identical; only `locked` moves to a v3 source.
- `.../contract/deployments` — faithful.
- `.../contract/{method}` — faithful (avoids the v3 defect below).
- `.../keys` (+count) — **collapses to a single 100-key page** (the legacy envelope has no cursor field).
- `.../txns-only` (+count) — `from`/`to` map to v3 signer/receiver; per-row `id`, `receipt_conversion_tokens_burnt`, per-action `deposit`/`fee`/`args` → `null`.
- `.../receipts` (+count) — **heaviest loss:** transaction-level columns (`block_timestamp`, `block.block_height`, `included_in_block_hash`, `receipt_conversion_tokens_burnt`, txn `outcomes.status`, `outcomes_agg.transaction_fee`, `actions_agg.deposit`) → `null`; receipt identity, both parties, txn hash and the per-receipt action list survive.
- `.../ft-txns`, `.../nft-txns` (+counts) — `event` filter honoured; `outcomes` → `{status: null}`, `outcomes_agg` → `{transaction_fee: null}`; `meta` renamed back to `ft`/`nft`.
- `GET /v2/account/{a}/receipts` (+count) — `before_timestamp` passes through; **`after_timestamp` → 422**.

Counts across this domain are estimates from v3 aggregates rather than v1's planner estimate.

> **v3 defect found while porting `contract/{method}`.**
> `sql/queries/accounts/contracts/action.sql` filters on `method` alone with **no account
> predicate**, while `services/v3/accounts/contract.ts` passes an `account` param the SQL
> never references. So `/v3/accounts/{account}/contract/{method}/action` returns the latest
> action of **any** contract exposing that method. The proxy restores the
> `receipt_receiver_account_id` predicate; **the v3 endpoint itself should be fixed
> separately** (v3 is frozen on this branch).

### Fungible / non-fungible tokens
Two changes affect **values**, not just fields — validate these first:
- **Token-transfer lists/counts return only the crediting side** — one row where v1
  returned two (debit + credit). Affects `/v1/fts/txns`, `/v1/fts/{c}/txns`,
  `/v1/nfts/txns`, `/v1/nfts/{c}/txns`, `/v1/nfts/{c}/tokens/{t}/txns` and their counts.
- **`/v1/nfts/{c}/holders/count` changes definition** — v3 counts holder rows (one per
  account **per token**), so the value is always ≥ v1's distinct-account count.

Detail endpoints (`/v1/fts`, `/v1/nfts`, `/{contract}`, holders, token list/detail,
`/v2/mts/contract/{c}/{token_id}`) proxy with missing fields → `null` (`livecoinwatch_id`,
NFT socials, `description`/`copies`/`extra`, `reference_hash`), NFT token list capped at
`per_page` 24, and MT detail sourced from indexed metadata instead of live RPC. Endpoints
that previously offered only `page` gain an optional opaque `cursor`.

### Stats & analytics
- `GET /v1/stats` — `high_24h`/`high_all`/`low_24h`/`low_all`/`id` → `null` (not in the split schema); `change_24h`/`volume_24h` renamed back.
- `GET /v1/stats/price` — faithful.
- `GET /v1/analytics/{account}/balance` — **loses the gap-filled dense series**, capped at the newest 365 rows; `date` converted back to the v1 ns string.

### Legacy supply / fees
- `GET /v1/legacy/circulating-supply` — faithful (including v1's quirks).
- `GET /v1/legacy/total-supply` — figure from the v3 stats snapshot, `timestamp` from the newest block; individually correct, can be seconds out of step. All `unit`/`format` variants (including the `unit=near` bare-text body CoinMarketCap/CoinGecko poll) are reproduced.
- `GET /v1/legacy/fees` — faithful; reads per-day `tokens_burnt` (yoctoNEAR) straight off the `outcome_stats` aggregate, the same execution-outcome sum v1 computed. `day` → yesterday, `week` → the last 7 complete days; a missing day emits `0`.
- `GET /v1/legacy/ping`, `POST /v1/legacy/nodes` — untouched (never hit a DB).

### Validators
- `GET /v1/validators` — `validatorTelemetry` → `[]`; per-row `index`/`telemetry` omitted; `description` `null` without a metadata row; `epochStatsCheck` carries the seat price as a string. **`page` is still honoured** (the legacy handler sliced a full list).

### Exports
`start`/`end` are fully expressible; column layout, ordering, filename and `Content-Type`
are reproduced byte-for-byte.
- `/v1/account/{a}/txns/export`, `/receipts/export` — **`Txn Fee` empty** (no v3 source); sourced from the v3 receipt export.
- `/v2/account/{a}/receipts/export`, `/v1/account/{a}/txns-only/export` — faithful.
- `/v1/account/{a}/{ft,nft}-txns/export` — range filter is the event timestamp; un-synced contracts drop out.

## Not supported (`410 Gone`)

`services/proxy/deprecated.ts` responds `410` with `Deprecation: true` and a `Link` to the
v3 migration guide. Wired:

| Path | Why not proxyable |
|---|---|
| `/v1/account/{a}/activities` (+count) | per-event balance-change feed aggregated away |
| `/v1/account/{a}/txns` (+count) | receipt-centric row model (`txns-only` is proxied) |
| `/v1/account/{a}/stake-txns` (+count) | legacy receipt shape shares no fields with v3 staking-txns |
| `/v1/account/{a}/tokens`, `/inventory`, `/contract/parse` | no v3 source / shape not derivable |
| `/v2/account/{a}/inventory/mts` | v2 reads live RPC; v3 indexes a different asset universe |
| `/v1/accounts/eth` | ETH-implicit account listing has no v3 endpoint |
| `/v1/kitwallet/account/{a}/activities`, `/callReceivers`, `/receipts` (+count) | no v3 kitwallet equivalent |
| `/v1/charts`, `/v1/charts/latest`, `/v1/charts/tps` | several columns (`addresses`, `total_addresses`, `avg_gas_limit`, `avg_gas_price`, `multichain_txns`, `new_accounts`, `deleted_accounts`, `unique_contracts`) exist nowhere in v3 — deprecated outright |
| `/v1/chain-abstraction/*` (txns, count, `multi-chain-accounts`) | v1 multichain retired — not carried onto v3 |

## Ingress carve-out & sunset

Endpoints that still have consumers should be routed to the old instance by an ingress
carve-out rather than left to `410`.

- **Default:** every path (`/v1`, `/v2`, `/v3`) → the new single instance (split DBs,
  proxy enabled). Catch-all `Prefix` rule.
- **Carve-out:** only the not-supported paths that still have consumers → the old v1/v2
  instance (legacy DB). One higher-precedence regex Ingress.
- **End state:** the carve-out shrinks to zero, the old instance and legacy DB are deleted,
  and the not-supported paths fall through to the new instance's `410` stub.

### Tiers (confirm against 30-day usage telemetry before dropping anything)

- **Tier A — needed by our own frontend** (carve out until the app migrates):
  `/v1/account/{a}/inventory` (account page), `/v1/account/{a}/contract/parse` (contract
  tab), `/v2/account/{a}/inventory/mts` (MT inventory).
- **Tier B — external wallet / tax / integrator traffic** (carve out until the sunset
  date): `/v1/kitwallet/account/{a}/{activities,receipts,receipts/count,callReceivers}`,
  `/v1/account/{a}/{activities,txns,stake-txns}` (+count).
- **Tier C — no known consumers** (`410` from day one; promote to the carve-out only if
  telemetry shows real traffic): `/v1/accounts/eth`, `/v1/account/{a}/tokens`.

### Ingress (ingress-nginx)

One additional Ingress with anchored regex paths, higher precedence than the catch-all:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-legacy-carveout
  annotations:
    kubernetes.io/ingress.class: nginx
    nginx.ingress.kubernetes.io/use-regex: 'true'
    nginx.ingress.kubernetes.io/configuration-snippet: |
      more_set_headers "Deprecation: true";
      more_set_headers "Sunset: Wed, 30 Sep 2026 00:00:00 GMT";
      more_set_headers "Link: <https://api.nearblocks.io/api-docs/migration>; rel=\"deprecation\"";
spec:
  rules:
    - host: api.nearblocks.io
      http:
        paths:
          # Tier A
          - path: /v1/account/[^/]+/inventory$
            pathType: ImplementationSpecific
            backend: { service: { name: api-legacy, port: { number: 3000 } } }
          - path: /v1/account/[^/]+/contract/parse$
            pathType: ImplementationSpecific
            backend: { service: { name: api-legacy, port: { number: 3000 } } }
          - path: /v2/account/[^/]+/inventory/mts$
            pathType: ImplementationSpecific
            backend: { service: { name: api-legacy, port: { number: 3000 } } }
          # Tier B
          - path: /v1/kitwallet/account/[^/]+/(activities|receipts|receipts/count|callReceivers)$
            pathType: ImplementationSpecific
            backend: { service: { name: api-legacy, port: { number: 3000 } } }
          - path: /v1/account/[^/]+/(activities|txns|stake-txns)(/count)?$
            pathType: ImplementationSpecific
            backend: { service: { name: api-legacy, port: { number: 3000 } } }
```

Notes:
- `api-legacy` = the existing v1/v2 deployment (legacy `DB_URL_*`), scaled to minimal
  replicas; everything else hits the new instance through the existing catch-all ingress.
- Regexes are anchored (`$`) so proxied siblings (`/txns-only`, v2 `/receipts`, kitwallet
  `likely*`) still go to the new instance.
- Dropping a path from this Ingress automatically starts returning the new instance's `410`
  stub — closure is a one-line ingress change, no deploys.

### Rollout / closure

1. Flip `V1_PROXY_ENABLED=true` on the new instance; apply the carve-out ingress.
2. Watch usage telemetry per carve-out path (all bearer-key tracked).
3. Tier A: land v3 replacements or frontend migrations, remove paths one by one.
4. Tier B: publish the sunset date, notify the known kitwallet consumers, remove after the date.
5. Delete the `api-legacy` deployment + legacy DB when the carve-out list is empty.

## Not yet verified

Nothing here has run against a live split DB. The surface is compile- and lint-clean, but
the compatibility notes are derived from reading SQL, not from observed responses. Validate
each domain in staging against the split DBs (`V1_PROXY_ENABLED=true`) before rollout.
