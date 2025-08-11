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
  r.originated_from_transaction_hash AS transaction_hash
FROM
  action_selected ar
  JOIN receipts r ON r.receipt_id = ar.receipt_id
WHERE
  r.included_in_block_timestamp = ar.receipt_included_in_block_timestamp
LIMIT
  1
