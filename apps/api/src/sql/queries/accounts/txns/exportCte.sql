txns_selected AS (
  (
    SELECT
      t.block_timestamp,
      t.shard_id,
      t.index_in_chunk,
      t.transaction_hash,
      t.receiver_account_id,
      t.signer_account_id,
      t.included_in_block_hash,
      t.converted_into_receipt_id,
      t.receipt_conversion_tokens_burnt
    FROM
      transactions t
    WHERE
      t.signer_account_id = ${account}
      AND t.block_timestamp >= ${start}::BIGINT
      AND t.block_timestamp <= ${end}::BIGINT
    ORDER BY
      t.block_timestamp ASC,
      t.shard_id ASC,
      t.index_in_chunk ASC
    LIMIT
      5000
  )
  UNION
  (
    SELECT
      t.block_timestamp,
      t.shard_id,
      t.index_in_chunk,
      t.transaction_hash,
      t.receiver_account_id,
      t.signer_account_id,
      t.included_in_block_hash,
      t.converted_into_receipt_id,
      t.receipt_conversion_tokens_burnt
    FROM
      transactions t
    WHERE
      t.receiver_account_id = ${account}
      AND t.block_timestamp >= ${start}::BIGINT
      AND t.block_timestamp <= ${end}::BIGINT
    ORDER BY
      t.block_timestamp ASC,
      t.shard_id ASC,
      t.index_in_chunk ASC
    LIMIT
      5000
  )
)
