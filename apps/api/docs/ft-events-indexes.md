# `ft_events` index proposal

**For review. Nothing here has been applied.**

Two indexes on `ft_events` cost 331 GB and are barely read. One index the hot
path needs does not exist. This proposes dropping two and adding one, which
leaves the write path cheaper than it is today.

`ft_events` is **13.8 billion rows / 7.27 TB across 68 chunks** on
`mainnet-events`, and every insert maintains all eight indexes.

## Current indexes

| index | columns | size | `idx_scan` |
|---|---|---|---|
| `fe_shard_type_index_uidx` | `(block_timestamp, shard_id, event_type, event_index)` DESC | — | heavy |
| `fe_block_timestamp_brin_idx` | `(block_timestamp)` BRIN | small | — |
| `fe_contract_sort_idx` | `(contract_account_id, block_timestamp, shard_id, event_type, event_index)` | — | heavy |
| `fe_account_sort_idx` | `(affected_account_id, block_timestamp, shard_id, event_type, event_index)` | — | heavy |
| `fe_contract_account_timestamp_idx` | `(contract_account_id, affected_account_id, block_timestamp)` | — | — |
| `fe_affected_contract_idx` | `(affected_account_id, contract_account_id)` | — | — |
| **`fe_involved_idx`** | `(involved_account_id)` | **187 GB** | **152** |
| **`fe_cause_idx`** | `(cause)` | **144 GB** | **7,828** |

Re-check the two candidates before acting — `idx_scan` accumulates from the
last stats reset, so confirm the window is long enough to be meaningful:

```sql
SELECT indexrelname, pg_size_pretty(pg_relation_size(indexrelid)) AS size,
       idx_scan, stats_reset
FROM pg_stat_user_indexes i
JOIN pg_stat_database d ON d.datname = current_database()
WHERE indexrelname LIKE '%fe_involved%' OR indexrelname LIKE '%fe_cause%';
```

## Proposed drops

**`fe_involved_idx` — 187 GB, 152 scans.** 152 reads against 13.8 billion rows
of maintenance. `involved_account_id` appears in `SELECT` lists throughout the
API but is not a filter predicate on any hot path.

**`fe_cause_idx` — 144 GB, 7,828 scans.** `cause` has a handful of distinct
values (`TRANSFER`, `MINT`, `BURN`), so a btree over it is close to useless —
any lookup matches a large fraction of the table. Where `cause` appears in
queries it is as `ft.cause = 'BURN' OR ft.delta_amount >= 0`, an OR that no
single-column index can serve. Confirmed on a real plan: the filter discarded
19 of 44 rows examined and cost nothing.

Both are online operations:

```sql
DROP INDEX CONCURRENTLY fe_involved_idx;
DROP INDEX CONCURRENTLY fe_cause_idx;
```

On a hypertable these must be issued per chunk, or via
`timescaledb_information.chunks`. They cannot run inside a transaction block.

## Proposed addition

```sql
CREATE INDEX CONCURRENTLY fe_receipt_timestamp_idx
  ON ft_events (receipt_id, block_timestamp DESC);
```

### Why

The transaction detail page looks up FT events by `receipt_id`. **No index
covers it**, so the query falls back to scanning the 5-minute timestamp window
and filtering. Measured on nearblocks-2:

```
Index Scan using _hyper_37_376_chunk_fe_shard_type_index_uidx
  Index Cond: (block_timestamp <= ... AND block_timestamp >= ...)
  Filter: (receipt_id = '9Qw2HUDgBaQVemYBqSawSLR8B7BqHkzJKMrvZBQPgpde')
  Rows Removed by Filter: 3885
  Buffers: shared hit=1006 read=11
  Execution Time: 3.605 ms
```

3,887 rows read to return 2. With the index this becomes a point lookup —
roughly 5 buffers instead of 1,017.

Against `pg_stat_statements`, this query shape totals **~2.2 wall-seconds per
second** on the replica, the largest single query cost on `mainnet-events`.

### Interaction with the application change

The commits on this branch batch the per-receipt `UNION ALL` into a single
`receipt_id = ANY(...)` query, which removes the repetition (~34 scans → 1)
without any schema change. **That lands most of the win on its own.**

The index is complementary, not required: it makes the one remaining scan a
seek. Deploy the application change first, measure, then decide whether the
index is still worth it.

## Net effect on writes

Eight indexes maintained per insert becomes seven. On a 7.27 TB table with
continuous ingest that is a **reduction** in write amplification, not an
increase — which is the main reason to consider the three changes together
rather than the addition alone.

## What still needs checking

- `nft_events` and `mt_events` have the same shape and the same missing
  `receipt_id` index. Not measured; the same reasoning likely applies.
- `idx_scan` on the drop candidates should be re-read over a full week before
  committing, in case either serves a monthly or ad-hoc job.
- Confirm no admin tooling, export job, or migration filters on
  `involved_account_id` or `cause` outside `apps/api`.
