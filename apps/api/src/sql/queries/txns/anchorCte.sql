txn_selected AS (
  SELECT
    ${block_timestamp}::BIGINT AS block_timestamp,
    ${shard_id}::INT AS shard_id,
    ${index_in_chunk}::INT AS index_in_chunk,
    ${transaction_hash}::TEXT AS transaction_hash,
    ${receiver_account_id}::TEXT AS receiver_account_id,
    ${signer_account_id}::TEXT AS signer_account_id,
    ${included_in_block_hash}::TEXT AS included_in_block_hash,
    ${converted_into_receipt_id}::TEXT AS converted_into_receipt_id,
    ${receipt_conversion_tokens_burnt}::NUMERIC AS receipt_conversion_tokens_burnt,
    ${receipt_conversion_gas_burnt}::NUMERIC AS receipt_conversion_gas_burnt
)
