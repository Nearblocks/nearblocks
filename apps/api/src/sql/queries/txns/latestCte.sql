txns_selected AS (
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
  ORDER BY
    t.block_timestamp DESC,
    t.shard_id DESC,
    t.index_in_chunk DESC
  LIMIT
    ${limit}
)
