## 📚 Indexer Receipts

Base indexer works with basic information about receipts 🧾

### Receipts completeness check (this branch)

On this branch the container runs a one-off, read-only completeness check instead of the live indexer. Deploy it as its own deployment or job from `ghcr.io/nearblocks/indexer-receipts:backfill-receipts`, never over the live indexer-receipts deployment.

It scans every UTC day from the first execution outcome up to the start of today, using the replica when `READ_DATABASE_URL` is set, and reports:

- executed receipts that have no `receipts` row,
- executed receipts that have no `action_receipt_actions` rows,
- receipts whose action indexes have a gap.

Each day with a problem is logged as a warning (counts, block height range, one sample receipt id), and a summary with every finding is logged at the end. Nothing is repaired. The check cannot see Data receipts, because they have no execution outcome.

Resume: progress is stored in the `settings` table under the key `receipts-check` (never the live indexer's key). The cursor only advances over days that are all finished, and findings are stored with it, so an interrupted pod continues from the last finished day. Restarting after completion checks only the days since the last run, so it can run daily.

Windows adapt to the data volume and are split automatically when a query is slow or returns too many rows, because the database proxy kills queries after about 35 seconds.

The earlier block-range backfill (`src/scripts/backfillMissing.ts`, range in `src/scripts/range.ts`) is kept but not wired to the entrypoint.

### Config

```
DATABASE_URL=
NETWORK=mainnet

# Optional
READ_DATABASE_URL=
DATABASE_CA=
DATABASE_CERT=
DATABASE_KEY=
FASTNEAR_API_KEY=
SENTRY_DSN=
```
