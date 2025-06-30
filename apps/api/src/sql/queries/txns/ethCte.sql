txn_selected AS (
  WITH
    action_selected AS (
      SELECT
        ar.receipt_included_in_block_timestamp,
        ar.receipt_id
      FROM
        action_receipt_actions ar
      WHERE
        ar.nep518_rlp_hash = ${hash}
        AND ar.receipt_included_in_block_timestamp >= ${start} -- rolling window start
        AND ar.receipt_included_in_block_timestamp <= ${end} -- rolling window end
      LIMIT
        1
    )
  SELECT
    t.block_timestamp,
    t.shard_id,
    t.index_in_chunk,
    t.transaction_hash,
    t.receiver_account_id,
    t.signer_account_id,
    t.included_in_block_hash,
    t.converted_into_receipt_id,
    t.receipt_conversion_tokens_burnt,
    t.receipt_conversion_gas_burnt
  FROM
    action_selected ar
    JOIN receipts r ON r.receipt_id = ar.receipt_id
    JOIN transactions t ON t.transaction_hash = r.originated_from_transaction_hash
  WHERE
    t.block_timestamp >= (
      SELECT
        a.receipt_included_in_block_timestamp - 300000000000 -- 5m in ns
      FROM
        action_selected a
    )
    AND t.block_timestamp <= (
      SELECT
        a.receipt_included_in_block_timestamp
      FROM
        action_selected a
    )
    AND r.included_in_block_timestamp = (
      SELECT
        a.receipt_included_in_block_timestamp
      FROM
        action_selected a
    )
  LIMIT
    1
)
