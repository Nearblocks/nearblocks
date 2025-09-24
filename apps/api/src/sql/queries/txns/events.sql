WITH
  txn_selected AS (
    SELECT
      t.block_timestamp,
      t.transaction_hash
    FROM
      transactions t
    WHERE
      t.transaction_hash = ${hash}
      AND t.block_timestamp >= ${start} -- rolling window start
      AND t.block_timestamp <= ${end} -- rolling window end
  )
SELECT
  r.receipt_id,
  r.included_in_block_timestamp AS block_timestamp
FROM
  receipts r
WHERE
  r.originated_from_transaction_hash = (
    SELECT
      transaction_hash
    FROM
      txn_selected
  )
  AND r.included_in_block_timestamp >= (
    SELECT
      block_timestamp
    FROM
      txn_selected
  )
  AND r.included_in_block_timestamp <= (
    SELECT
      block_timestamp
    FROM
      txn_selected
  ) + 300000000000 -- 5m in ns
