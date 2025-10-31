SELECT
  TO_CHAR(TO_TIMESTAMP(date / 1e9), 'YYYY-MM-DD') AS date,
  active_accounts,
  active_contracts,
  active_meta_accounts,
  active_meta_relayers,
  blocks,
  chunks,
  circulating_supply,
  gas_fee,
  gas_used,
  market_cap,
  meta_txns,
  near_btc_price,
  near_price,
  new_accounts,
  new_contracts,
  receipts,
  shards,
  total_supply,
  txn_fee,
  txn_fee_usd,
  txn_volume,
  txn_volume_usd,
  txns
FROM
  daily_stats
WHERE
  (
    ${date}::BIGINT IS NULL
    OR date = ${date}::BIGINT
  )
ORDER BY
  date DESC
LIMIT
  ${limit}
