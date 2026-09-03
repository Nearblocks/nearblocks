## 🪙 Indexer FT State

Decodes fungible token balances directly from contract state changes into `ft_state_balances`, using a static layout table for the handful of non-standard contracts and structural detection, gated on nep141 events or `ft_transfer` receipts, for everything else.

The `settings` cursor key is fixed at `ft_state`; `aggregates` reads the same key to roll balances into `ft_state_holders`.

### RPC balance audit

When `RPC_URL` is set (must be an **archival** node — samples can reach back years), a background loop cross-checks decoded balances against `ft_balance_of` to catch layouts that decode cleanly but read the wrong storage slot.

- Every distinct contract already in `ft_state_holders` is seeded into `ft_state_verifications` (a resumable backfill, cursor in `settings['ft_state_verify']`), plus every contract newly decoded by the live stream. This covers dormant contracts from years ago, not just what the live stream happens to touch.
- Roughly once a minute, one contract is drawn from the roster (never-audited first, then longest since last audit) and checked against 3 randomly drawn holders via RPC — a flat, predictable RPC budget independent of roster size.
- 2+ mismatching samples marks the contract `ft_state_untracked` (`rpc_mismatch`); `ft_balance_of` missing or reverting on every sample marks it `not_ft`; a single mismatch triggers one escalation round on 3 fresh accounts before deciding.
- A contract is re-audited at most once per `VERIFY_COOLDOWN_DAYS` (on different random accounts each time), so confidence accumulates across passes rather than being fixed at the first samples ever drawn. A redeploy (`contract_code_update`) resets a contract's verdict and puts it back at the front of the rotation.
- If `RPC_URL` is unset, the audit is disabled entirely and the indexer behaves exactly as it did before this feature.

**Rows are never deleted** from `ft_state_balances` or `ft_state_holders` when a contract is untracked — every reader of those tables must anti-join `ft_state_untracked` (`WHERE NOT EXISTS (SELECT 1 FROM ft_state_untracked u WHERE u.contract = ...)`), as `aggregates` and `indexer-tvl` already do.

### Config

```
DATABASE_URL=
NETWORK=mainnet
RPC_URL= (archival)

# Optional
DATABASE_CA=
DATABASE_CERT=
DATABASE_KEY=
FASTNEAR_API_KEY=
NEARDATA_CONCURRENCY=auto
NEARDATA_URL=
SENTRY_DSN=

VERIFY_COOLDOWN_DAYS=30
VERIFY_DRAW_ATTEMPTS=6
VERIFY_INTERVAL_MS=60000
VERIFY_MAX_ATTEMPTS=5
VERIFY_MIN_LAG_BLOCKS=100
VERIFY_SAMPLES=3
VERIFY_SEED_BATCH=5000
```
