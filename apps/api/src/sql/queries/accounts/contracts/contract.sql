SELECT
  contract_account_id AS account_id,
  code_hash,
  code_base64
FROM
  contract_code_events
WHERE
  contract_account_id = ${account}
ORDER BY
  block_timestamp DESC,
  shard_id DESC,
  index_in_chunk DESC
LIMIT
  1
