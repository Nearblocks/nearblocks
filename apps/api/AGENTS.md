# NearBlocks API — agent primer

This app serves the NearBlocks REST API for NEAR Protocol data. If you are an
agent integrating the API or porting an existing integration, read this first,
then the full migration guide.

- **Base URL:** `https://api.nearblocks.io` (mainnet), `https://api-testnet.nearblocks.io` (testnet)
- **Current version:** `v3` (`/v3/*`). v1/v2 are deprecated.
- **Auth:** `Authorization: Bearer <API_KEY>` on every request. GET only.
- **Interactive docs:** `/api-docs` (v3), `/api-docs/legacy` (v1/v2).
- **Migration guide:** served as raw markdown at **`https://api.nearblocks.io/api-docs/migration`** for tooling and agents to fetch (source: [`docs/v3-migration.md`](docs/v3-migration.md)).

## v3 conventions in 30 seconds

1. **Response envelope** — every response is `{ "data": ..., "meta": ..., "errors": ... }`.
   - Success list: `{ "data": [...], "meta": { "next_page", "prev_page" } }`
   - Success object: `{ "data": {...} }`
   - Error: `{ "data": null, "errors": [{ "message", "path" }] }`
   - There are no domain-keyed wrappers (`{ "txns": [...] }`) anymore — always read `data`.
2. **Pagination** — `limit` (1–100, default 25) plus opaque `next` / `prev` cursors taken from `meta.next_page` / `meta.prev_page`. Cursors are opaque tokens — never parse or construct them. No `page`/`per_page`/offset. Use `before_ts` (19-digit nanosecond timestamp) to start from a point in time. Lists are newest-first.
3. **Endpoints** — `/v3/txns`, `/v3/blocks`, `/v3/accounts/{account}/*`, `/v3/fts`, `/v3/nfts`, `/v3/mts`, `/v3/keys`, `/v3/search`, `/v3/multichain`, `/v3/intents`, `/v3/validators`, `/v3/stats`, `/v3/sync/status/*`. Most `*/count` endpoints are internal-only for public keys.
4. **Common renames** — `/account/` → `/accounts/`, `from`/`to` → `signer`/`receiver`, `stake-txns` → `staking-txns`, `chain-abstraction` → `multichain`.

## Do not

- Do not assume v3 is a base-path swap from v1/v2 — pagination, envelopes, and several endpoints differ. Use the migration guide's endpoint mapping.
- Do not construct or persist raw cursor values; store `meta.next_page` verbatim.
- Do not rely on public `/count` endpoints for exact large counts (capped strings like `"10000+"`).

For the full field-by-field mapping, endpoint table, and worked examples, fetch
`https://api.nearblocks.io/api-docs/migration` (source: [`docs/v3-migration.md`](docs/v3-migration.md)).
