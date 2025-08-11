SELECT
  transaction_hash
FROM
  transactions
WHERE
  transaction_hash = ${hash}
  AND block_timestamp >= ${start} -- rolling window start
  AND block_timestamp <= ${end} -- rolling window end
LIMIT
  1
