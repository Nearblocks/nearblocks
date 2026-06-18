# FT balance accuracy — research notes

Why account FT balances can be wrong, how fastNEAR avoids it, what `feat/assets`
does today, and how we could become self-sufficient. Companion scripts:

- `scripts/ft-decode-selftest.mjs` — offline proof of the decoder logic (no network).
- `scripts/ft-state-decode-proof.mjs` — live proof: decode balances from on-chain
  state changes and diff against `ft_balance_of` (needs egress to a NEAR RPC host).

## The problem (today)

`ft_holders.amount` is a **cumulative sum of NEP-141 event deltas**:

- `apps/indexer-events/src/services/ft.ts` turns `ft_transfer/ft_mint/ft_burn` logs
  into signed `delta_amount` rows in `ft_events`.
- `apps/aggregates/src/services/ft.ts` does `SUM(delta_amount)` into `ft_holders`
  with `ON CONFLICT … SET amount = ft_holders.amount + EXCLUDED.amount`.

Failure modes: (1) **value drift** — a missing/wrong event corrupts the running sum
permanently; (2) **discovery gaps** — a token that emits no events never appears.
Root cause: we trust the contract's *log narration* instead of its *actual storage*.

## How fastNEAR does it

- API server (`fastnear-api-server-rs`) is a **cache reader**: balances live in Redis
  (`b:<token>` hash, `ft:<account>` map); `src/api.rs` `v1::ft` reads the cache. The
  RPC-on-read path is experimental.
- The number is produced at **ingest** (`transfers-indexer/src/block_indexer.rs`):
  discover affected pairs from `EVENT_JSON` logs **and** `FunctionCall` action
  inspection, then emit `Task::FtBalance{ contract, account, block_hash }` and resolve
  all of a block's tasks in **one batched RPC round-trip** (`ft_balance_of`).
- So events/actions decide *when to re-read*; the value is always a real
  `ft_balance_of` snapshot. Missing events → stale read that self-heals, never a wrong sum.

## What `feat/assets` does today

The `feat: account token assets` work serves `/v3/accounts/{account}/assets/fts` by
**calling fastNEAR directly** and falling back to our event-sum table:

- `apps/api/src/libs/fastnear.ts` → `getAccountFtBalances()` GETs
  `${fastnearUrl}/v1/account/{account}/ft` (5s timeout, 30s Redis cache,
  returns `[{contract, amount}]`, `null` on any error).
- `apps/api/src/services/v3/accounts/assets.ts`: if fastNEAR answered, join its
  amounts to our `ft_meta` (`ftsBalances.sql`); else read `ft_holders` (`fts.sql`).

Implication: balances are **authoritative while fastNEAR is up**, but the fallback is
the same drift-prone `ft_holders`, and we now depend on fastNEAR's uptime/limits/cost.
(NFT/MT assets are not outsourced — they read local `nft_holders`/`mt_holders`.)

## Options to fix it in-house

| | Source of the number | Freshness | Ongoing RPC | Event-independent |
|---|---|---|---|---|
| **A. State-change decode** | block `data_update` storage value | real-time | ~0 (calibration + non-standard only) | yes |
| **B. Dirty-set + debounced `ft_balance_of`** | RPC | seconds–min lag | tunable | yes |
| **C. Per-block `ft_balance_of`** | RPC | real-time | highest | yes |

**Option A is viable here** — our block stream already carries the data:

- `packages/nb-types/src/enums.ts` defines `data_update`/`data_deletion`.
- `packages/nb-neardata/src/type.ts` `StateChange.change = { accountId, keyBase64, valueBase64 }`.
- `apps/indexer-balance/src/services/balance.ts` already decodes `account_update`
  (native NEAR balance); FT is the same pipeline pointed at `data_update`.

Decode (standard `near-contract-standards` FT = `LookupMap<AccountId, Balance>`):
key = `prefix ++ borsh(account_id)` (= `prefix ++ u32-LE len ++ utf8`), value =
`borsh(u128)` = 16 LE bytes. Trust model: state changes are the protocol's record of
the contract's real storage writes — same source `ft_balance_of` reads — so this is as
authoritative as RPC and strictly better than events. Non-standard layouts (hashed keys)
don't decode → fall back to RPC, gated by **per-contract calibration** (confirm one
decode vs `ft_balance_of`, then trust/cache).

## Cost sizing (measured)

`count(*)` of `ft_events` over 1h ×24 ≈ **1,281,912 balance touches/day** ≈ 38.5M/mo.
That is the worst case (Option C, no dedup) and already fits a 100M-req/mo plan.
Option B (dedup over a refresh window) is far less; Option A is ~0 ongoing RPC.

## Recommendation

Make `ft_holders` authoritative via Option A (state-change decode + RPC fallback for
non-standard contracts, per-contract calibration). Keep fastNEAR as primary in
`feat/assets` if desired, but this removes the silent drift on the fallback path and
lets us drop the external dependency later. Step 1: a `data_update` decoder + a
calibration harness (verify decoded balances vs `ft_balance_of` on top contracts by
volume) before any write-path change.

## Open questions

1. Decodable coverage **by volume** (standard `LookupMap` vs hashed/custom) — the key
   number; measure with `scripts/ft-state-decode-proof.mjs` over busy blocks.
2. `data_deletion` handling (unregister/zero), backfill of already-drifted balances
   (one-time `view_state` per token), RPC provider batch-billing & `view_state` limits.
