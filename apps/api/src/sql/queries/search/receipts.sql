SELECT
  receipt_id,
  originated_from_transaction_hash AS transaction_hash
FROM
  receipts
WHERE
  receipt_id = ${receipt}
  AND included_in_block_timestamp >= ${start} -- rolling window start
  AND included_in_block_timestamp <= ${end} -- rolling window end
LIMIT
  1
