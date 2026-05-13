#!/usr/bin/env bash
# validate-counts.sh - measure count strategies on the new TimescaleDB base DB.
#
# Compares:
#   - count_cost_estimate (OLD pattern, drifts badly on hypertables)
#   - approximate_row_count (NEW unfiltered pattern)
#   - LIMIT 10001 with OR (single-query naive)
#   - UNION ALL with LIMIT 10001 (NEW account pattern - the 30x faster one)
#   - real COUNT(*) windowed (ground truth for short ranges)
#
# Usage:
#   DB_URL=postgres://user:pass@host:5432/dbname ./validate-counts.sh
#   DB_URL=... ./validate-counts.sh sarin.near   # override one account
#
# Outputs a markdown comparison table + a CSV log.

set -euo pipefail

DB_URL="${DB_URL:-${DB_URL_BASE:-}}"
if [[ -z "$DB_URL" ]]; then
  echo "ERROR: Set DB_URL (or DB_URL_BASE) to a psql connection string." >&2
  echo "  e.g. DB_URL='postgres://reader:pass@base-rw:5432/mainnet-base' $0" >&2
  exit 1
fi

# Accept an override account on the command line; otherwise we cycle through a fixed
# whale + small + random set.
OVERRIDE_ACCOUNT="${1:-}"

CSV_OUT="${CSV_OUT:-validate-counts.csv}"
echo "scenario,account,strategy,window,count,ms" > "$CSV_OUT"

# BSD `date` doesn't support %N - it prints the literal string "N" with exit 0,
# so we must try gdate first. macOS users need coreutils (`brew install coreutils`).
ts_ns() {
  if command -v gdate >/dev/null 2>&1; then
    gdate +%s%N
  else
    # GNU date (Linux). Detect bad output (BSD) by checking for trailing 'N'.
    local out
    out="$(date +%s%N)"
    if [[ "$out" == *N ]]; then
      echo "ERROR: GNU date required for nanosecond timing. brew install coreutils" >&2
      exit 1
    fi
    echo "$out"
  fi
}

# psql wrapper. Strips whitespace, returns first row first column.
run_sql() {
  local sql="$1"
  psql "$DB_URL" -At -F'|' -c "$sql" 2>/dev/null
}

# Time a query in milliseconds. Returns "<count>|<ms>".
timed_sql() {
  local sql="$1"
  local start_ns end_ns ms result
  start_ns="$(ts_ns)"
  result="$(run_sql "$sql" | head -1)"
  end_ns="$(ts_ns)"
  ms=$(( (end_ns - start_ns) / 1000000 ))
  echo "${result}|${ms}"
}

log_csv() {
  echo "$1,$2,$3,$4,$5,$6" >> "$CSV_OUT"
}

heading() {
  printf "\n## %s\n\n" "$1"
}

# Pick a random small account by sampling a recent 1-day window.
# We pull DISTINCT signers from a random chunk near head (avoiding the very latest hour
# which the cagg policy hasn't covered).
pick_random_account() {
  local sql="
    SELECT signer_account_id
    FROM transactions
    WHERE block_timestamp >= epoch_nano_seconds() - 7776000000000000  -- last 90 days
      AND block_timestamp <  epoch_nano_seconds() - 86400000000000     -- exclude last 1 day
    LIMIT 1 OFFSET (random() * 100)::int
  "
  run_sql "$sql" | head -1 | tr -d '[:space:]'
}

build_accounts() {
  if [[ -n "$OVERRIDE_ACCOUNT" ]]; then
    echo "$OVERRIDE_ACCOUNT|override"
    return
  fi
  echo "relay.aurora|whale"
  echo "sarin.near|small"
  local random_account
  random_account="$(pick_random_account)"
  if [[ -n "$random_account" ]]; then
    echo "${random_account}|random"
  fi
}

###############################################################################
# Section A: Unfiltered table-total counts
###############################################################################

heading "Unfiltered table totals"
printf "| Table | Strategy | Count | Time (ms) |\n"
printf "|---|---|---:|---:|\n"

for table in blocks transactions receipts; do
  # OLD: count_cost_estimate
  res="$(timed_sql "SELECT count::TEXT FROM count_cost_estimate('SELECT 1 FROM ${table}')")"
  count="${res%|*}"; ms="${res#*|}"
  printf "| %s | count_cost_estimate (OLD) | %s | %s |\n" "$table" "$count" "$ms"
  log_csv "totals" "-" "count_cost_estimate" "$table" "$count" "$ms"

  # NEW: approximate_row_count
  res="$(timed_sql "SELECT approximate_row_count('${table}')::TEXT")"
  count="${res%|*}"; ms="${res#*|}"
  printf "| %s | **approximate_row_count (NEW)** | %s | %s |\n" "$table" "$count" "$ms"
  log_csv "totals" "-" "approximate_row_count" "$table" "$count" "$ms"
done

###############################################################################
# Section B: Account-direction OR counts (relay.aurora / sarin.near / random)
###############################################################################

heading "Per-account txn counts (OR-direction)"
printf "| Account | Class | Strategy | Count | Time (ms) |\n"
printf "|---|---|---|---:|---:|\n"

while IFS='|' read -r account class; do
  [[ -z "$account" ]] && continue

  # OLD: count_cost_estimate on OR
  sql_old="SELECT count::TEXT FROM count_cost_estimate(
    \$\$SELECT block_timestamp FROM transactions
       WHERE signer_account_id = '${account}'
          OR receiver_account_id = '${account}'\$\$
  )"
  res="$(timed_sql "$sql_old")"
  printf "| %s | %s | count_cost_estimate OR (OLD) | %s | %s |\n" \
    "$account" "$class" "${res%|*}" "${res#*|}"
  log_csv "account_txns" "$account" "count_cost_estimate_OR" "all-time" "${res%|*}" "${res#*|}"

  # Single LIMIT 10001 with OR (naive)
  sql_or="SELECT COUNT(*)::TEXT FROM (
    SELECT 1 FROM transactions
    WHERE signer_account_id = '${account}'
       OR receiver_account_id = '${account}'
    LIMIT 10001
  ) sub"
  res="$(timed_sql "$sql_or")"
  printf "| %s | %s | LIMIT 10001 OR | %s | %s |\n" \
    "$account" "$class" "${res%|*}" "${res#*|}"
  log_csv "account_txns" "$account" "limit_or" "all-time" "${res%|*}" "${res#*|}"

  # NEW: UNION ALL split with LIMIT 10001
  sql_new="SELECT LEAST(COUNT(*), 10000)::TEXT FROM (
    (SELECT 1 FROM transactions WHERE signer_account_id = '${account}' LIMIT 10001)
    UNION ALL
    (SELECT 1 FROM transactions WHERE receiver_account_id = '${account}'
        AND signer_account_id <> '${account}' LIMIT 10001)
    LIMIT 10001
  ) sub"
  res="$(timed_sql "$sql_new")"
  printf "| %s | %s | **UNION ALL LIMIT 10001 (NEW)** | %s | %s |\n" \
    "$account" "$class" "${res%|*}" "${res#*|}"
  log_csv "account_txns" "$account" "union_all_limit" "all-time" "${res%|*}" "${res#*|}"
done < <(build_accounts)

###############################################################################
# Section C: Per-account receipts (the harder case - includes EXISTS join)
###############################################################################

heading "Per-account receipt counts (OR-direction)"
printf "| Account | Class | Strategy | Count | Time (ms) |\n"
printf "|---|---|---|---:|---:|\n"

while IFS='|' read -r account class; do
  [[ -z "$account" ]] && continue

  # NEW UNION ALL pattern
  sql_new="SELECT LEAST(COUNT(*), 10000)::TEXT FROM (
    (SELECT 1 FROM receipts WHERE predecessor_account_id = '${account}' LIMIT 10001)
    UNION ALL
    (SELECT 1 FROM receipts WHERE receiver_account_id = '${account}'
        AND predecessor_account_id <> '${account}' LIMIT 10001)
    LIMIT 10001
  ) sub"
  res="$(timed_sql "$sql_new")"
  printf "| %s | %s | UNION ALL LIMIT 10001 (NEW) | %s | %s |\n" \
    "$account" "$class" "${res%|*}" "${res#*|}"
  log_csv "account_receipts" "$account" "union_all_limit" "all-time" "${res%|*}" "${res#*|}"
done < <(build_accounts)

###############################################################################
# Section D: Random chunk windows (does chunk-exclusion hold regardless of age?)
###############################################################################
#
# Pick 5 random 30-day windows from history (chain age ~5y on mainnet, 4y on testnet)
# and measure real COUNT(*) per window for the whale. Verifies Timescale's chunk
# exclusion is effective across the table, not just on the head.

heading "Random 30-day chunk windows for relay.aurora"
printf "| Window start (ns ago) | Count | Time (ms) |\n"
printf "|---:|---:|---:|\n"

# Mainnet genesis was ~July 2020 -> ~5.8 years -> ~183M seconds.
# Random offset between 0 and 5y, then 30d window after.
MAX_AGE_S=$(( 5 * 365 * 24 * 3600 ))
WIN_S=$(( 30 * 24 * 3600 ))

for _ in 1 2 3 4 5; do
  offset_s=$(( RANDOM * MAX_AGE_S / 32767 ))
  window_start_ns=$(( $(date +%s) * 1000000000 - offset_s * 1000000000 ))
  window_end_ns=$(( window_start_ns + WIN_S * 1000000000 ))

  sql_win="SELECT COUNT(*)::TEXT FROM (
    (SELECT 1 FROM transactions
      WHERE signer_account_id = 'relay.aurora'
        AND block_timestamp >= ${window_start_ns}::BIGINT
        AND block_timestamp <  ${window_end_ns}::BIGINT
      LIMIT 10001)
    UNION ALL
    (SELECT 1 FROM transactions
      WHERE receiver_account_id = 'relay.aurora'
        AND signer_account_id <> 'relay.aurora'
        AND block_timestamp >= ${window_start_ns}::BIGINT
        AND block_timestamp <  ${window_end_ns}::BIGINT
      LIMIT 10001)
    LIMIT 10001
  ) sub"
  res="$(timed_sql "$sql_win")"
  printf "| %s | %s | %s |\n" "$offset_s" "${res%|*}" "${res#*|}"
  log_csv "random_window" "relay.aurora" "union_all_window" "${offset_s}s_ago" "${res%|*}" "${res#*|}"
done

###############################################################################
# Section E: EXPLAIN ANALYZE the headline UNION ALL plan to confirm chunk excl.
###############################################################################

heading "EXPLAIN ANALYZE: UNION ALL on relay.aurora (sanity-check plan shape)"
echo '```'
psql "$DB_URL" -c "
EXPLAIN (ANALYZE, BUFFERS, TIMING ON)
SELECT LEAST(COUNT(*), 10000) FROM (
  (SELECT 1 FROM transactions WHERE signer_account_id = 'relay.aurora' LIMIT 10001)
  UNION ALL
  (SELECT 1 FROM transactions WHERE receiver_account_id = 'relay.aurora'
      AND signer_account_id <> 'relay.aurora' LIMIT 10001)
  LIMIT 10001
) sub;
" 2>&1 | sed 's/^/  /'
echo '```'

echo
echo "CSV log written to: $CSV_OUT"
