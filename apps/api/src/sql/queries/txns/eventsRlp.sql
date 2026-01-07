WITH
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
      t.transaction_hash
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
