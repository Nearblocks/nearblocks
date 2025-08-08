SELECT
  ak.account_id,
  ak.public_key,
  ak.permission_kind,
  ak.permission,
  COALESCE(c.txn, '{}'::JSONB) AS created,
  COALESCE(d.txn, '{}'::JSONB) AS deleted
FROM
  access_keys ak
  LEFT JOIN LATERAL (
    SELECT
      JSONB_BUILD_OBJECT(
        'block',
        JSONB_BUILD_OBJECT(
          'block_hash',
          b.block_hash,
          'block_height',
          b.block_height::TEXT,
          'block_timestamp',
          b.block_timestamp::TEXT
        ),
        'transaction_hash',
        t.transaction_hash
      ) AS txn
    FROM
      receipts r
      JOIN transactions t ON t.transaction_hash = r.originated_from_transaction_hash
      AND t.block_timestamp <= ak.created_by_block_timestamp
      AND t.block_timestamp > ak.created_by_block_timestamp - 300000000000 -- 5m in ns
      JOIN blocks b ON b.block_hash = t.included_in_block_hash
      AND b.block_timestamp <= ak.created_by_block_timestamp
      AND b.block_timestamp > ak.created_by_block_timestamp - 300000000000 -- 5m in ns
    WHERE
      r.included_in_block_timestamp = ak.created_by_block_timestamp
      AND r.receipt_id = ak.created_by_receipt_id
  ) c ON TRUE
  LEFT JOIN LATERAL (
    SELECT
      JSONB_BUILD_OBJECT(
        'block',
        JSONB_BUILD_OBJECT(
          'block_hash',
          b.block_hash,
          'block_height',
          b.block_height::TEXT,
          'block_timestamp',
          b.block_timestamp::TEXT
        ),
        'transaction_hash',
        t.transaction_hash
      ) AS txn
    FROM
      receipts r
      JOIN transactions t ON t.transaction_hash = r.originated_from_transaction_hash
      AND t.block_timestamp <= ak.deleted_by_block_timestamp
      AND t.block_timestamp > ak.deleted_by_block_timestamp - 300000000000 -- 5m in ns
      JOIN blocks b ON b.block_hash = t.included_in_block_hash
      AND b.block_timestamp <= ak.deleted_by_block_timestamp
      AND b.block_timestamp > ak.deleted_by_block_timestamp - 300000000000 -- 5m in ns
    WHERE
      r.included_in_block_timestamp = ak.deleted_by_block_timestamp
      AND r.receipt_id = ak.deleted_by_receipt_id
  ) d ON TRUE
WHERE
  ak.public_key = ${key}
LIMIT
  1
