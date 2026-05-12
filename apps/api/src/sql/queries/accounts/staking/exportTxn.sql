SELECT
  r.receipt_id,
  t.transaction_hash,
  JSONB_BUILD_OBJECT(
    'block_hash',
    b.block_hash,
    'block_height',
    b.block_height::TEXT,
    'block_timestamp',
    b.block_timestamp::TEXT
  ) AS block,
  COALESCE(eo.outcomes, JSONB_BUILD_OBJECT('status', NULL)) AS outcomes
FROM
  receipts r
  JOIN transactions t ON t.transaction_hash = r.originated_from_transaction_hash
  JOIN blocks b ON b.block_hash = t.included_in_block_hash
  LEFT JOIN LATERAL (
    SELECT
      JSONB_BUILD_OBJECT(
        'status',
        (status IN ('SUCCESS_RECEIPT_ID', 'SUCCESS_VALUE'))
      ) AS outcomes
    FROM
      execution_outcomes
    WHERE
      receipt_id = t.converted_into_receipt_id
    LIMIT
      1
  ) eo ON TRUE
WHERE
  r.receipt_id = ANY (${ids}::TEXT [])
