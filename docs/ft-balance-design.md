# FT balance accuracy — final design

How to make account FT balances **authoritative and self-sufficient** (no fastNEAR
dependency) by reading them from contract storage state changes we already ingest,
falling back to RPC only for contracts that provably don't decode.

Companion evidence and scripts:

- `docs/ft-balance-research.md` — background, the fastNEAR comparison, options A/B/C.
- `scripts/ft-decode-selftest.mjs` — offline proof of the decoder byte-layout (no network).
- `scripts/ft-state-decode-proof.mjs` — live proof: decode balances from on-chain state
  changes and diff against `ft_balance_of` (7/7 byte-exact every run).

---

## 1. The problem today

`ft_holders.amount` is a **cumulative sum of NEP-141 log deltas**:

- `apps/indexer-events/src/services/ft.ts` turns `ft_transfer/ft_mint/ft_burn`
  `EVENT_JSON` logs into signed `delta_amount` rows in `ft_events`.
- `apps/aggregates/src/services/ft.ts` does `SUM(delta_amount)` into `ft_holders` with
  `ON CONFLICT … SET amount = ft_holders.amount + EXCLUDED.amount`.

Three failure modes, all structural:

1. **Value drift** — one missing/wrong event corrupts the running sum _permanently_.
2. **Discovery gaps** — a token that emits no events never appears.
3. **Legacy tax** — non-event tokens need hand-written per-contract parsers
   (`apps/indexer-events/src/services/contracts/ft/` — 13 hardcoded contracts, mainnet
   only, no backfill). Anything not on that list is invisible.

Root cause: we trust the contract's _log narration_ instead of its _actual storage_.

---

## 2. How the decode works (the mechanism)

NEAR storage is a key→value trie. Every storage write in a block is recorded as a
`data_update` state change (and deletes as `data_deletion`). These are **already in the
neardata block stream we ingest** — `apps/indexer-balance` decodes the `account_update`
flavor for native NEAR balances and _discards_ `data_update`. FT balances are the same
pipeline pointed at `data_update`.

The standard NEP-141 (`near-contract-standards` `FungibleToken`) stores balances in one
field, `accounts: LookupMap<AccountId, Balance>` (`Balance = u128`). A near-sdk
`LookupMap` serialises each entry as:

```
storage key   = <map prefix bytes> ++ borsh(account_id)
              = <prefix> ++ <u32-LE length> ++ <utf8 account id>
storage value = borsh(u128) = 16 little-endian bytes
```

The decoder (`scripts/ft-state-decode-proof.mjs`) inverts this:

- **Value** must be exactly 16 bytes → read as u128 LE; else not a balance slot.
- **Key**: `<map prefix bytes> ++ <u32-LE len> ++ <utf8 account>`, account valid
  (`/^[a-z0-9._-]+$/`, len 2–64).

The decoded `(contract, account, balance)` **is the contract's real storage** — the same
bytes `ft_balance_of` reads. So it is authoritative and strictly better than the event
sum: storage is ground truth and self-heals (each write overwrites the slot), where an
event sum drifts forever.

> **Prefix-pinning is mandatory — and `startsWith` is NOT enough (C1 + round-2 NEW-C2).**
> A standard FT contract has _several_ `AccountId`-keyed maps besides balances:
> `storage_deposit` balances, staking/locked/vesting amounts, ERC-20-style allowances. A
> sibling `LookupMap<AccountId, u128>` (e.g. `locked[alice] = 500`) is byte-indistinguishable
> from the balance map if we scan-and-discard the prefix — it would decode to
> `(contract, alice, 500)` and **silently overwrite alice's real balance**. Two traps:
>
> 1. The **exploratory forward-scan** (used only by the proof/measurement scripts to
>    _discover_ a prefix) MUST NOT be the production decoder — it tries every offset and will
>    happily skip extra bytes to find an account tail.
> 2. **`key.startsWith(prefix)` is insufficient.** If balances pin at `[0x02]` and a sibling
>    map sits at `[0x02, 0x07]` (nested enum / longer manual prefix), its keys _start with_ > `0x02` and a loose scan decodes them as balances.
>
> **Production rule — exact-offset parse.** Calibration records the exact prefix **length L**
> (computed from a known account: `L = keyLen − (4 + len(account))`). The production decoder
> accepts a slot **only if**, rooted exactly at byte L, the remaining bytes are _exactly_ > `borsh(account)` = `<u32-LE len><utf8>` with **no leftover** (`L + 4 + len == keyLen`) and
> value is 16 bytes. No scan, no skip. A `[0x02,0x07]` sibling fails this (offset L=1 doesn't
> yield a valid account), so it's rejected. The 32-byte `StorageBalance` struct is already
> filtered by the 16-byte value guard. Without exact-offset pinning, the design ships
> silently-wrong balances.

**Last-write-wins per (contract, account) within a block is mandatory.** An account can be
written by several receipts in one block; only the _final_ write equals `ft_balance_of` at
that block. The decoder dedupes to the last write per account per block.

---

## 3. Live verification (proven)

`scripts/ft-state-decode-proof.mjs` over recent mainnet blocks, decoded value vs
`ft_balance_of` at the **same** block:

- **7/7 byte-exact every run** across the busiest real FTs — `wrap.near`,
  `usdt.tether-token.near`, the `*.omft.near` bridge tokens, ref-labs DCL pools,
  `aa-harvest-moon.near`, and hex-named contracts still using a standard `LookupMap`.
- **False positives are real and bounded** — DEX/router contracts (`v2.ref-finance.near`,
  `aggregatedex.near`, `v2_1.omni.hot.tg`) emit FT-_shaped_ slots that aren't NEP-141 maps;
  `ft_balance_of` returns nothing parseable. That's the calibration signal (§5), confirmed.
- `rpc.mainnet.near.org` is **dead** (HTTP 200 + a `-429` "DEPRECATED" body that silently
  zeroed verification); the script now defaults to `free.rpc.fastnear.com`.

> **What 7/7 proves and what it doesn't.** It proves the byte layout and that the _balance_
> slot equals `ft_balance_of` — that the mechanism is real. It does **not** certify a whole
> contract: the sample checked a few accounts on the balance prefix, so it cannot rule out
> a _sibling_ AccountId→u128 map (staking/locked/allowance) that also decodes (the C1 risk
> in §5). The Phase-1 measurement (§11) is the real test: decode **every** 16-byte slot for
> the top-N contracts over a long window and diff **each** against `ft_balance_of` — that
> either surfaces sibling maps or retires the concern, and yields the verified prefix.

---

## 4. The contracts indexer as a calibration accelerator

`apps/indexer-contract` is a **contract-code deployment ledger**: it streams blocks and
records `ContractCodeUpdate`/`Deletion` into `contract_code_events`
(`contract_account_id`, `code_hash`, `code_base64`, global-contract refs). No standards
detection today — but it gives us **`code_hash`**.

Most FTs are deployed from a few templates (`near-contract-standards` FT, the omft
factory, bridge factory…), so thousands of contracts share **identical `code_hash`**.
Therefore: **use `code_hash` to carry the verified _prefix_, re-checked per contract.**
Same wasm ⇒ same prefix-selection _logic_, but a contract can place its accounts map under
a different runtime/constructor-chosen prefix (H1), so inheritance is "try the code's known
prefix first and confirm with one `ft_balance_of`," not blind trust. Still a big win: one
cheap verify per new contract instead of a blind search.

Two caveats on the join (H1/H2): `contract_code_events` is an **append-only event log**,
not a current-state table — resolving a contract's code identity at block H needs
`DISTINCT ON (contract_account_id) … WHERE block_height <= H ORDER BY block_height DESC`,
honoring `DELETE` rows; and **global-contract rows carry `code_hash = NULL`** (identity is
`global_code_hash` / `global_account_id`). The calibration key must handle both. A small
materialized `contract_current_code` view keeps this off the hot path.

**Unlocked / redeployable contracts — this is exactly why we key on `code_hash`.** Most
NEAR contracts keep a full-access key and can **redeploy new code at any time**, changing
their storage layout. That would silently break a per-_contract_ `standard` flag — but a
redeploy **is a `ContractCodeUpdate` with a new `code_hash`**, which `indexer-contract`
already captures. So the redeploy is a first-class invalidation signal: when a contract's
current `code_hash` changes, its calibration is void → it returns to `uncalibrated` →
safe-path (RPC) until the _new_ code identity is re-calibrated. A contract can't change
layout without changing `code_hash`, and we can't miss the change because we index every
deploy. (An `uncalibrated` window after redeploy means brief eventual-consistency on that
contract, never a wrong decode.)

**Do we RPC-check every new contract? No — per _code identity_, amortized.** First sighting
of a **new `code_hash`** → full calibration (find + verify the balance prefix, a few
`ft_balance_of` calls). First sighting of a **new contract of an already-known `code_hash`**
→ **one** confirm call (same code can place the map under a different prefix, H1), then it
inherits `standard`. So a popular template costs one calibration ever, plus one cheap
confirm per deployed instance — not a blind RPC per contract.

**Where does this live — in `indexer-contract`?** No. `indexer-contract` stays a pure code
ledger; coupling FT logic into it violates its single responsibility and it has no balance
context. Instead the **calibration worker** (part of the async resolver, §5) _subscribes to_
new/changed code identities from `contract_code_events` and runs calibration out of band.
One optimization the ledger _does_ enable: it stores `code_base64`, so we could **statically
detect FT candidates from the wasm** (does it export `ft_balance_of`? does it match a known
`near-contract-standards` signature?) to pre-filter before any RPC — a cheap accelerator,
not a replacement for the decode-vs-`ft_balance_of` proof.

---

## 5. Standards detection, the flag, and the fallback

The decoder is a heuristic on bytes; it can be wrong two ways: a non-FT slot that _looks_
FT-shaped (false positive), or a real FT with a non-standard layout (hashed keys, packed
struct) that decodes garbage. **A silent wrong decode is the one unacceptable outcome** —
it corrupts `ft_holders`, the exact failure we're escaping. So we never trust the
heuristic; we **calibrate per code_hash and prove it**.

Two layers:

**(a) Interface check — cheap pre-filter, not sufficient.** NEP-141 mandates
`ft_balance_of` / `ft_total_supply` / `ft_metadata`. No `ft_balance_of` → not an FT. But
passing this says nothing about _storage layout_ — it only gates eligibility.

**(b) Decode-then-verify calibration — the real proof.** First time we see an FT-shaped
slot for a contract, decode it and call `ft_balance_of(account)` once at that block:

- decoded **==** RPC → layout is standard `LookupMap`. Record the **exact key prefix** of
  the verified slot and mark `standard`. From then on, decode **only** slots whose key
  begins with that prefix (kills the C1 sibling-map corruption). Zero further RPC.
- decoded **≠** RPC, or RPC panics / method missing → mark `non_standard` / `not_ft`.

Persisted verdict — table `ft_calibration` keyed by **resolved code identity** plus the
pinned prefix. Code identity is `code_hash` _or_, for global contracts, `global_code_hash`
/ the current hash behind `global_account_id` (in `contract_code_events`, global-contract
rows carry `code_hash = NULL`, so a naive `code_hash` join misses an entire class — H1). A
`contract`-level override row handles the rare instance that deviates from its code peers.

| status         | meaning                                                        | balance source going forward                 |
| -------------- | -------------------------------------------------------------- | -------------------------------------------- |
| `standard`     | decoded == `ft_balance_of`; **prefix pinned**                  | **decode pinned-prefix slots** (0 RPC)       |
| `non_standard` | decodes, but decoded ≠ RPC (hashed / packed / other map)       | **async RPC `ft_balance_of`** (queued)       |
| `not_ft`       | no `ft_balance_of` / it panics (ref-finance/aggregatedex case) | **ignore** — not token balances              |
| `uncalibrated` | first sighting, not yet verified                               | **async RPC** (queued) + trigger calibration |

> **Calibration must verify the prefix, not just one account.** `standard` certifies a
> _prefix_, not a contract. To set it safely, sample several accounts under the candidate
> prefix and confirm each `== ft_balance_of`; a contract with two AccountId→u128 maps will
> show DIFFs on the wrong prefix and the right prefix is the one that matches. Per-code
> inheritance then carries the _prefix_, re-checked on first sighting of each new contract
> of that code (cheap: one verify), because the same wasm can place the map under a
> different runtime-chosen prefix (H1).

**The indexer NEVER blocks on RPC (H4 — the throughput-critical rule).** RPC is not
guaranteed-latency; a synchronous `ft_balance_of` in the per-block loop would push block
processing past the ~1s block interval and the indexer falls off the tip — and once it
lags >~2.5 days, historical reads hit GC'd state on non-archival RPC (H3) and fail
entirely. So the loop is split, exactly like fastNEAR (ingest decides _when to re-read_; a
separate resolver does the read):

```
# hot path — in the indexer, per block, NO network:
on data_update for (contract, account, key) at block_height, shard, idx:
    verdict = calibration.get(codeIdentity(contract, at=block_height))   # height-aware (NEW-H3)
    if verdict == standard
       and verdict.verifiedThroughHeight >= block_height                 # cross-stream guard
       and exactPrefixParse(key, verdict.prefix) == account:             # exact, not startsWith (NEW-C2)
        monotonicUpsert(contract, account, decode(change), block_height, shard, idx)  # 0 RPC
    elif verdict in (non_standard, uncalibrated) or unknownDeployStatus(contract, block_height):
        enqueue Task{contract, account, block_height}   # ft_balance_tasks; keep moving
    elif verdict == not_ft:
        skip
    # standard but key fails exact parse -> ignore: sibling map, not a balance

on data_deletion for a pinned-prefix balance slot:
    monotonicUpsert(contract, account, 0, block_height, shard, idx)      # same path, not a side path (NEW-M4)

# monotonic upsert — the ONLY writer primitive, used by BOTH the hot path and the resolver:
#   ON CONFLICT (contract,account) DO UPDATE
#     SET amount=excluded.amount, block_height=excluded.block_height, shard=…, idx=…
#     WHERE (excluded.block_height, excluded.shard, excluded.idx)
#         >= (ft_holders_v2.block_height, ft_holders_v2.shard, ft_holders_v2.idx)
#   -> a stale resolver write can NEVER clobber a newer inline write (NEW-C1); the
#      (height,shard,idx) tuple also resolves intra-block last-write (C2).

# resolver — separate worker, out of band, batched & rate-limited:
drain ft_balance_tasks (NEWEST block first) -> group by block -> batched ft_balance_of (archival)
    -> monotonicUpsert(...) -> on uncalibrated, run calibration & set verdict
    -> dead-letter tasks whose block_height is older than archival retention (NEW-H4)
```

The tip never waits on RPC: standard tokens resolve inline at chain speed; non-standard/new
tokens get **eventually-consistent** balances from the resolver.

Safety properties (with round-2 fixes):

- **Monotonic writes (NEW-C1).** Both writers go through `monotonicUpsert`; a later
  `(block_height, shard, idx)` always wins, so the async resolver can't overwrite a newer
  inline value with a stale historical read. This also subsumes C2 (intra-block ordering)
  and M2 (re-orgs reconcile forward).
- **Exact-prefix parse (NEW-C2).** `standard` authorizes only slots that parse _exactly_ at
  the pinned offset — `startsWith` is not used. Sibling maps that merely share a prefix are
  rejected.
- **Cross-stream height guard (NEW-H3).** `indexer-ft-balance` and `indexer-contract` have
  independent cursors. A `standard` verdict is trusted only up to the height its code
  identity is confirmed through; if ft-balance runs ahead of the contract indexer (or a
  deploy sits unprocessed in the window), the contract is treated as `uncalibrated` (RPC
  path), never decoded under a possibly-stale prefix. Closes the redeploy race.
- **Default is the safe path, never a guessed decode.** Unknown ⇒ `uncalibrated` ⇒ queued.
- **Re-calibration guard.** Re-verify a `standard` code's pinned decode vs RPC on a sampled
  cadence; on mismatch, demote (and §10's re-resolve). A redeploy changes `code_hash` ⇒
  forced re-calibrate; the height guard covers the window before we notice.

**Calibration picks the prefix rigorously (NEW-C2).** From a known account in a verified
slot, compute the exact prefix length `L = keyLen − (4 + len(account))` — we don't guess it
by scanning. Then require **all** of several sampled accounts to match `ft_balance_of`,
preferring accounts with **non-zero, distinct** balances (zero-balance or balance==sibling
accounts can spuriously match the wrong map). Zero DIFFs required, not a majority.

---

## 6. Where RPC happens, and how much

The reframe that matters: **RPC is at index time, not query time.**

- **NEP-141 has no batch read.** `ft_balance_of` = one account, one contract, one balance.
  A portfolio of N tokens via pure RPC = **N calls** — and you still need our DB to know
  _which_ N tokens (NEP-141 can't list an account's tokens).
- **fastNEAR's "one call" is their infrastructure** (a pre-computed indexer + Redis cache,
  batched server-side), not a NEAR feature. Replicating that ourselves means _our_
  `ft_holders` becomes that cache.
- **Our read path:** portfolio query = **1 DB query, 0 RPC**. RPC leaves the read path.
- **Our RPC** is the async resolver (§5), **only for non-`standard` contracts**, **batched
  per block** (group a block's tasks into one round-trip, fastNEAR-style), never inline in
  the indexer. For the proven-standard majority it's **zero**.

Cost ceiling (worst case, every touch hits RPC): `count(*)` of `ft_events` over 1h ×24 ≈
**1.28M touches/day** ≈ 38.5M/mo. With calibration the standard majority decodes for free,
so real RPC is a small fraction. **But this must be sized against an _archival_ provider,
not a free tier (H3):** non-archival nodes GC state after ~5 epochs (~2.5 days), so any
fallback/calibration at a historical `block_id` (the indexer runs behind head, and backfill
is fully historical) needs archival RPC, which is paid. The free-tier framing was wrong;
budget archival pricing for the non-standard tail.

**Can RPC ever impact a user query?** In the steady state, **no** — every read is a DB hit
on `ft_holders_v2`. The one honest caveat is **eventual consistency for non-standard /
newly-seen tokens**: their balance comes from the async resolver, so right after a touch the
cached value can be briefly stale (or, for a brand-new token, missing) until the resolver
catches up. The default is to **serve the cached value (with a freshness timestamp) and
never do on-read RPC** — so query latency is always DB-only. If a product surface ever needs
guaranteed-fresh non-standard balances, an _opt-in_ on-read refresh is possible, but that
deliberately reintroduces query-time RPC and should be the exception, not the path. Standard
tokens have no staleness — their balance is written inline at chain tip.

---

## 7. Architecture: a dedicated FT-balance indexer

A new stream consumer (`indexer-ft-balance`, or an extension of `indexer-balance`) modeled
exactly on the native-balance path:

1. **Source:** the same neardata block stream (`streamBlock` from `nb-neardata`), its own
   cursor in `settings`. The `data_update` key/value bytes are already in
   `Message.shards[].stateChanges[]` — **no extra fetch, no full reindex**.
2. **Per block:** collect `data_update` changes, look up the calibration verdict (§5), and
   either decode-inline (standard, pinned prefix) or enqueue a resolver task. No RPC here.
3. **Write:** authoritative current-state `ft_holders_v2(contract, account, amount,
block_height)` (upsert) **and** an append-only time-series `ft_balance_events` (§8a).
   Stand both up as **shadow tables first**, diffed against today's event-sum `ft_holders`
   to quantify drift before any cutover.
4. **`data_deletion`** on a _pinned-prefix_ balance slot → account unregistered → balance 0
   (or row delete). A `data_deletion` on any non-pinned slot is ignored (it's a sibling map).

Two correctness items the native-balance path doesn't have to worry about but this does:

- **Intra-block ordering / multi-write (C2).** The neardata payload's `stateChanges` array
  carries **no ordering key** (`StateChange = {cause, change:{accountId,keyBase64,
valueBase64}, type}`), and shards are processed in parallel. "Last array element wins" is
  therefore a _guess_ for an account written twice in one block (or across shards during
  resharding). Do **not** rely on array position: when a `(contract, account)` has multiple
  `data_update`s in one block, the safe resolution is to treat it as `uncalibrated`-style
  and let the resolver read `ft_balance_of` at that block for the final value — or first
  prove empirically (over many multi-write cases) that payload order == execution order for
  a single shard and that cross-shard same-key collisions never occur.
- **Finality / re-orgs (M2).** `ft_holders_v2` is a _current-state_ upsert, so a write
  decoded from a block that later orphans is **not** self-correcting (unlike the append-only
  native `balance_events`). Decode only finalized blocks, or reconcile on finality.

Otherwise this is the `indexer-balance` shape with `account_update` swapped for
`data_update` (cursor, sequential commit, batched insert, conflict resolution unchanged).

---

## 8. Current-state vs time-series, and what each costs to backfill

Native NEAR balances have **two** shapes, and FT should mirror both — but they backfill
very differently. This is the crux of the "can we have an FT balance time-series like NEAR"
question, and the answer is _yes, going forward, cheaply; historically, expensively._

**8a. The two tables.**

- **Current-state** `ft_holders_v2(contract, account, amount)` — upsert, "balance now."
  Each decoded `data_update` is an _absolute_ snapshot, so this is a direct upsert.
- **Time-series** `ft_balance_events(block_timestamp, block_height, contract, account,
amount, …)` — append-only TimescaleDB hypertable, "balance over time / charts." Exactly
  the `balance_events` pattern (`indexer-balance`), and state-decode is _ideal_ for it
  because each `data_update` already carries the **absolute** post-write balance — no
  cumulative-sum reconstruction, no drift. Overhead is the same order as the existing
  `ft_events` hypertable (~38.5M rows/mo, Timescale compression handles it). **So the
  time-series is possible and the overhead is acceptable — comparable to `ft_events`, which
  already exists.** Going forward it's _free_ (one row per decoded touch, no RPC for
  standard tokens).

**8b. Backfill — current-state is cheap, history is the hard part.**

- **Current-state backfill is bounded, not a history replay.** `view_state` returns a
  contract's balance map _as of one block_ in paginated RPC calls — seed `ft_holders_v2`
  per contract without streaming history. **Caveat (M1):** `view_state` has a hard
  result-size cap and is often disabled/limited on public RPC; on USDT / `wrap.near`
  (millions of keys) this is **not** "a few calls" — it needs archival, recent-block,
  heavy pagination, and may not complete. For those top contracts the practical seed is the
  current event-sum `ft_holders` baseline, then let forward decoding self-heal each account
  on its next touch.
- **Historical _time-series_ backfill is fundamentally expensive — this is the real
  overhead concern.** `view_state` gives one point in time, not history. To reconstruct
  absolute FT balances at _every past block_ you'd need either (i) a full historical
  **re-stream** of neardata through the decoder (heavy one-time job, but feasible since the
  state changes are in the archive), or (ii) `ft_balance_of` at many historical blocks
  (archival, prohibitive). **The `ft_events` cumulative sum is NOT an acceptable fallback
  for history** — fabricatable/missable events are the exact thing this design exists to
  escape, so trusting them for a historical chart re-imports the bug. The honest options
  are: **(a)** start the authoritative absolute series at indexer go-live and have no
  trustworthy absolute history before it, or **(b)** if exact history is required, do the
  one-time neardata **state re-stream** (the only fabrication-proof source of past
  balances). Pick per product need; do not silently backfill from events and call it
  authoritative.

**8c. Dropping fastNEAR.** `feat/assets` currently calls fastNEAR for `/v3/.../assets/fts`
and falls back to the drift-prone `ft_holders`. Once `ft_holders_v2` is authoritative the
fallback is correct on its own and the dependency can go; keep fastNEAR as belt-and-braces
during rollout, then retire it.

---

## 9. Legacy / non-event tokens

State-decode **retires the hardcoded-parser burden for any non-event token that still uses
standard `LookupMap` storage**: it reads storage, not events, so such a token decodes with
**zero** special-casing. Be precise about the win, though (M5): several of the 13 existing
hand-parsed contracts (`aurora`, `meta-pool.near`, `token.burrow.near`, …) are hand-parsed
_because their storage is non-standard_, so they land in the RPC-fallback bucket, not the
free-decode bucket — state-decode doesn't make them free, it just removes the need for a
_bespoke_ parser (generic `non_standard` + account-discovery handles them uniformly).

The one nuance: for a **non-standard** legacy layout we can't recover the account from the
key, so to call `ft_balance_of` we need the `(contract, account)` pair from elsewhere —
NEP-141 events if any, else `FunctionCall` arg inspection (`ft_transfer` receiver/sender),
exactly as fastNEAR does. So:

- standard legacy token → decoded for free, discovery is automatic from the key.
- non-standard legacy token → `non_standard` verdict + account discovered from
  action/event inspection → RPC refresh. Still no bespoke parser.

---

## 10. Validation — when and how we check the decoded state is right

Which indexer changes, and when RPC is used, stated plainly:

- **Indexer changed:** a **new `indexer-ft-balance`** (or an extension of `indexer-balance`)
  that consumes the neardata stream and decodes `data_update`. **Not** `indexer-events` and
  **not** `aggregates` — those stay as-is (the event pipeline can remain for the _transfer
  feed_, §11, but no longer feeds balances). Going forward, every block's pinned-prefix
  decode updates `ft_holders_v2` / `ft_balance_events` with **zero RPC** for standard tokens.
- **RPC is used in exactly three places, never in the hot loop and never at query time:**
  1. **Calibration** — first sighting of a code identity: decode a few accounts under the
     candidate prefix and confirm each `== ft_balance_of` to pin the prefix and set
     `standard`.
  2. **Non-standard fallback** — contracts that don't decode: the async resolver reads
     `ft_balance_of` (batched, archival).
  3. **Validation** — the ongoing audits below.

Three validation layers, cheap to strong:

1. **Per-touch (free).** For `standard` tokens nothing is needed — the decoded value _is_
   `ft_balance_of`'s source. The risk isn't the value, it's decoding the _wrong slot_
   (C1) — handled structurally by prefix-pinning.
2. **Total-supply invariant — an ALERT, not a gate (downgraded per round-2 NEW-H2).**
   `SUM(ft_holders_v2 where contract=X) == ft_total_supply(X)` is a cheap whole-contract
   smoke test (1 RPC + 1 aggregate), but it is **not** trustworthy enough to auto-quarantine
   on its own:

   - **False positives are common, on exactly the high-value contracts:** rebasing tokens
     (stNEAR/LiNEAR-style), fee-on-transfer, locked treasury/reserves excluded from
     `ft_balance_of`, and contracts where `total_supply` is a stored counter that drifts. So
     "N/A this contract" would disable the check where C1 is most likely.
   - **It can miss the corruption it's sold to catch:** an exact-prefix-pinned design (§2)
     shouldn't admit sibling writes at all, but if one slipped through, an _overwrite_ of an
     existing holder can land on either side of supply or within tolerance — the
     `sum>supply ⇒ C1, sum<supply ⇒ gap` dichotomy is false.
   - **Mid-backfill the sum is incomplete** → spurious `sum<supply`; only run once the
     contract's `coverage_complete` flag is set (backfill seed + forward-decode caught up).

   So: use it as an **alert-only signal**; never demote on it alone — require the
   random-sample audit (layer 3) to **corroborate** before any action.

3. **Random-sample audit (cheap, continuous) — the real gate.** Periodically diff random
   decoded `(contract, account)` pairs vs `ft_balance_of` at a recent (non-GC'd) block.
   This is the trustworthy automated demotion trigger; the supply invariant only escalates
   _which_ contracts to sample harder.

Plus the structural triggers: a **redeploy** changes `code_hash` ⇒ forced re-calibration
(and the §5 height guard covers the window before we notice); on backfill, a per-prefix
`view_state` reconcile where the node permits it.

**Cadence (tie work to risk, not a fixed clock):**

- _Supply invariant_ — **event-driven, plus a sampled rotation.** Re-run for a contract when
  its holder set changed, debounced per contract. **No unconditional daily full sweep**
  (NEW-M6): NEAR mainnet has on the order of _tens of thousands_ of FT contracts, and a
  daily archival RPC + full `SUM` over million-row holder tables is real, poorly-spent cost
  for a weak signal. Sweep changed contracts + a rotating sample of the quiet tail.
- _Random-sample_ — continuous low background rate; weight toward high-balance accounts and
  recently-calibrated code (highest blast radius).
- _Re-calibration_ — immediate on `code_hash` change; otherwise lazy.

**Action on a failed audit — fail safe, never serve a suspect decode:**

1. **Quarantine** the code identity (or single contract): set `non_standard`; the indexer
   stops trusting its decode immediately.
2. **Re-resolve, don't just stop (NEW-M1).** Balances written while `standard` are now
   suspect. Enqueue resolver tasks for **all current holders** of the contract (mark them
   stale), not only future touches — otherwise dormant accounts serve wrong balances forever.
3. **Fall back to RPC** for that contract going forward (the §5 resolver path).
4. **Alert** a human with the evidence (sample mismatch; supply delta as context).
5. **Re-derive / re-calibrate** the exact prefix; **only** return to `standard` after a clean
   re-calibration. A false demotion costs RPC; a missed corruption costs wrong balances.

**Plan for non-standard tokens' balances — yes, RPC into our own cache (this is exactly
what fastNEAR does, applied only to the minority).** For a `non_standard` contract we can't
decode, so each holder's balance comes from `ft_balance_of` and is stored in `ft_holders_v2`
— our cache. We discover _which_ `(contract, account)` to refresh the same way fastNEAR
does: inspect the block for affected pairs (NEP-141 events **and** `FunctionCall` arg
inspection — `ft_transfer` sender/receiver), enqueue resolver tasks, batch the reads per
block, write the results. fastNEAR runs this model for **every** token into Redis; we run
the **identical** model but **only for the non-standard tail**, because the standard
majority is already free via state-decode. So our design = fastNEAR's balance pipeline
restricted to the contracts that actually need it, with Postgres (`ft_holders_v2`) as the
cache instead of Redis. Strictly less RPC than fastNEAR, same correctness.

---

## 11. Transfers vs balances — state gives balances, not a transfer ledger

Important distinction you must not blur. **State changes give absolute balance _states_,
not semantic _transfers_.** A transfer alice→bob appears as two `data_update`s: alice's new
(lower) balance and bob's new (higher) balance. From state alone you get each account's
**net post-block balance**, but **not**: the (sender, receiver, amount, memo) tuple, the
pairing of who-paid-whom, or a decomposition when several transfers hit one account in a
block (you only see the net). So:

- **Balances → state changes are authoritative.** Use them. Fabrication-proof.
- **The transfer activity feed** (per-transfer rows, memos, counterparties) fundamentally
  needs receipt/event-level data — state can't reconstruct it. Reliability ranking of
  sources for that feed:
  1. **`FunctionCall` action + outcome inspection** (decode `ft_transfer` /
     `ft_transfer_call` args — `receiver_id`, `amount`, `memo` — and require the receipt to
     have _succeeded_; `ft_transfer` panics on failure, and `ft_transfer_call` refunds are
     visible via `ft_resolve_transfer`). This is what the actual call executed, more
     reliable than trusting emitted logs.
  2. **NEP-141 `EVENT_JSON`** — convenient and standard, but **fabricatable/missable**
     (the reason balances are leaving it).
- **Cross-check, don't trust blindly.** Because we now have authoritative state deltas, we
  can **validate the transfer feed against them**: for each `(contract, account)` in a
  block, `sum(event/action deltas) == decoded state delta`. If they disagree, the
  events are lying or incomplete → flag the contract / drop to action-inspection. This turns
  state into a **fabrication detector** for the activity feed, not just a balance source.

So "is events the most reliable way forward?" — **for balances, no** (state is); **for the
transfer feed, events are not the most reliable** — prefer action+outcome inspection, keep
EVENT_JSON only as a convenience source, and reconcile both against state deltas.

---

## 12. NEP-245 (multi-token / MT) balances — Phase 2, scoped to intents.near

Same architecture, but a crucial finding from researching the on-chain layouts: **NEP-245
standardizes the _interface_, not storage, and the two real implementations key balances
incompatibly.** Decodability depends entirely on which one a contract uses.

| Implementation                               | Balance storage                                                                       | token_id in the key?  | Who uses it                   |
| -------------------------------------------- | ------------------------------------------------------------------------------------- | --------------------- | ----------------------------- |
| **near-sdk-contract-tools**                  | flat `(token_id, account) → u128`                                                     | **yes, plaintext**    | **intents.near** (the volume) |
| reference impl (`theophoric/near-sdk-rs_mt`) | `UnorderedMap<TokenId, LookupMap<AccountId,u128>>`, inner prefix = `sha256(token_id)` | **no** (one-way hash) | niche / reference only        |

**The good news: the one contract that matters — `intents.near` (NEAR Intents) — uses the
decodable layout, and it's actually _easier_ than FT** (no nested collection, no hashing).
Its balance leaf key is, verbatim:

```
b"~$245" ++ [0x02] ++ <u32-LE len><token_id utf8> ++ <u32-LE len><account utf8>      value = u128 LE (16B)
└ root ┘   └ disc ┘  └──── borsh(&str token_id) ───┘ └──── borsh(&str account) ────┘
```

So we recover **both** `token_id` and `account` from the key — no `token_id` discovery
problem. intents' token_ids are namespaced strings (`nep141:wrap.near`,
`nep171:coll.near:1`, `nep245:game.near:id`), self-describing. Decode strategy:

1. Filter `data_update` whose key starts with the contract's NEP-245 root (`~$245`) + `0x02`
   — **pin this prefix per contract via calibration** exactly as FT (§5); a wrapper could
   namespace the root, so verify one decode against `mt_balance_of` before trusting.
2. Parse two length-prefixed strings (`token_id`, then `account`); value = 16-byte LE u128.
3. Key `ft_holders_v2`'s MT sibling on `(contract, token_id, account)`.

**The reference-impl layout is the hard case and we don't chase it in Phase 2:** the inner
map prefix is `sha256(token_id)`, irreversible from the key, so `token_id` is unrecoverable
from state alone (only practical because its ids are tiny sequential integers — a rainbow
table — which doesn't generalize). Such contracts get the `non_standard` treatment: RPC
`mt_balance_of` with `token_id`/account discovered from events/actions.

- **Validation:** `mt_balance_of(account, token_id)` / `mt_batch_balance_of`, and an
  `mt_supply(token_id)` invariant per (contract, token_id), analogous to §10.2.
- **Transfers/events** are the same fabricatable EVENT_JSON model as FT — bypassed by
  state-decode for balances, validated via §11 for the transfer feed.
- **Today** MT balances (`mt_holders`) are event-based, same fabrication exposure.

**Plan:** Phase 2, after FT proves out. Scope v1-MT to **contract-tools-layout contracts,
starting with `intents.near`** (highest value, fully decodable, both ids plaintext) — extra
work over FT is just parsing a second length-prefixed string. Treat any non-contract-tools
MT contract as lower-priority per-contract fingerprinting, and accept that a true
`sha256(token_id)` layout is RPC-only for `token_id`. NEP-171 NFTs are ownership, not
balances (`nft_holders`) — separate model, out of scope.

- **Same exact-parse + multi-sample discipline as FT (NEW-M5).** The two-string parse has
  the identical loose-scan exposure, so pin the exact offsets and require multiple non-trivial
  samples to match `mt_balance_of`. **Do not trust the `0x02` discriminant across
  contract-tools versions** — it's an enum ordinal that a version bump can shift; pin the
  discriminant region's bytes per code identity, and a `0x01` Token-record slot that happens
  to be 16 bytes must be rejected by the exact parse, not admitted.

> Open empirical check before building: dump `intents.near` `view_state` to byte-confirm its
> root prefix is bare `~$245` and not namespaced by a wrapper (hard gate, not a nicety).

---

## 13. Risks & open questions

Addressed in-design across two adversarial review rounds, each with a test that must pass:

- **C1 / NEW-C2 — sibling AccountId→u128 maps** (CRITICAL): exact-offset prefix parse, not
  `startsWith` (§2/§5). _Gate:_ `scripts/ft-coverage-phase1.mjs` groups every 16-byte
  account-keyed slot by prefix and flags any contract with >1 such prefix.
- **NEW-C1 — resolver clobbers newer inline write** (CRITICAL): single `monotonicUpsert`
  primitive guarded on `(block_height, shard, idx)` for both writers (§5). _Gate:_ enqueue a
  task at H, land an inline write at H+k, drain the task, assert the H+k value survives.
- **C2 — intra-block / cross-shard ordering**: subsumed by the monotonic tuple (§5/§7).
  _Gate:_ multi-write frequency (Phase-1 already measures it).
- **NEW-H3 — calibration races the contract-indexer cursor**: height-aware verdict lookup;
  ft-balance ahead of the contract indexer ⇒ `uncalibrated` (§5). _Gate:_ redeploy with a
  changed prefix; assert no inline decode between deploy block and re-calibration.
- **H4 — RPC stalls the indexer**: indexer never blocks on RPC; async batched resolver
  (§5/§6). _Gate:_ block processing stays < block interval under load.
- **NEW-H2 — supply invariant overtrusted**: downgraded to alert-only, corroborate before
  demote, `coverage_complete`-gated (§10).
- **H1/H2 — code identity**: `code_hash = NULL` global contracts + current-state resolution (§4).

Still open:

1. **Non-standard layout share of _volume_** — how much RPC the fallback really needs
   (Phase 1, `scripts/ft-coverage-phase1.mjs`).
2. **Proving sibling-map _absence_, not just non-observation (NEW-H1).** A touched-slot
   window finds corruption where it occurs but can't prove a rarely-written sibling map
   doesn't exist; public `view_state` is refused (`TOO_LARGE_CONTRACT_STATE`, confirmed). The
   absence-proof paths are **static analysis of `code_base64`** (enumerate the wasm's
   `BorshStorageKey` prefixes — `indexer-contract` already stores the code) and/or archival
   per-prefix `view_state` paging. Until then, exact-offset pinning bounds the blast radius
   and audits catch drift.
3. **Resolver backpressure (NEW-H4).** No unbounded queue: newest-block-first ordering,
   queue-depth/lag SLO + alerting, and a dead-letter path for tasks older than archival
   retention (else they fail permanently on GC'd state, H3).
4. **Archival RPC cost & `view_state` feasibility** (H3/M1) — pick + price a provider.
5. **Finality** — decode only finalized blocks vs reconcile-on-finality (M2).
6. **`near_sdk::store` vs `collections` (NEW-M2)** — `store::LookupMap` uses a different key
   encoding and caches writes; different `code_hash` so it calibrates separately, but the
   exact-parse must be validated against `store`'s layout, not assumed identical. Add to
   Phase-1 enumeration.
7. **near-sdk collection drift (M4)** — `UnorderedMap`/`TreeMap` accounts maps add an index
   vector (another sibling-map source); characterize per code identity in Phase 1.

---

## 14. Phased plan

1. **Measure (no write path).** `scripts/ft-coverage-phase1.mjs` — over a long block window,
   group **every** 16-byte account-keyed `data_update` by key prefix per contract and diff
   each prefix vs `ft_balance_of`. Outputs: decodable coverage _by volume_, the non-standard
   tail, the verified balance prefix per contract, multi-write frequency (C2), and — the C1
   gate — any contract with >1 account-keyed u128 prefix. **Known limit (NEW-H1):** a window
   only sees _written_ prefixes, so a clean result is "no sibling seen", not proof of absence;
   the absence-proof is wasm static analysis of `code_base64` and/or archival per-prefix
   `view_state` (open #2). Early run (40 blocks) already shows real FTs decode to a single
   balance prefix, false-positives classify as `not-an-FT`, and 0 sibling prefixes.
2. **Calibration store + harness.** `ft_calibration(code_identity, prefix, status, …)`, the
   decode-then-verify-prefix routine, and `contract_current_code` (handling DELETE and
   `code_hash = NULL` global contracts).
3. **Shadow indexer.** `indexer-ft-balance` decode-inline (pinned prefix) + async resolver,
   writing `ft_holders_v2` and `ft_balance_events`; finalized blocks only; diff vs event-sum
   `ft_holders`, quantify drift, no user-facing change.
4. **Backfill (current-state).** `view_state` snapshots to seed `ft_holders_v2` for top
   contracts where feasible; event-sum baseline + forward self-heal where `view_state` can't
   complete. **No event-based absolute-history backfill** (§8b — events are the untrusted
   source); if exact history is needed, a one-time neardata state re-stream is the only
   fabrication-proof source.
5. **Cutover.** Point `feat/assets` fallback at `ft_holders_v2`; retire fastNEAR primary;
   delete drift-prone paths once green.
6. **Phase 2 — MT (NEP-245).** Extend the same machinery to `(contract, token_id, account)`,
   scoped to contract-tools-layout contracts starting with `intents.near` (§12); leave
   `sha256(token_id)`-layout contracts on RPC fallback.
