SELECT
  1
FROM
  signatures
WHERE
  block_timestamp >= ${start}::BIGINT
  AND (
    ${before}::BIGINT IS NULL
    OR block_timestamp < ${before}
  )
  AND (
    ${account}::TEXT IS NULL
    OR account_id = ${account}
  )
  AND (
    ${chain}::TEXT IS NULL
    OR tx_chain = ${chain}
  )
  AND (
    ${address}::TEXT IS NULL
    OR tx_address = ${address}
  )
  AND (
    ${txn}::TEXT IS NULL
    OR tx_hash = ${txn}
  )
