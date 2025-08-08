WITH
  keys_selected AS (
    SELECT
      public_key,
      account_id,
      created_by_block_timestamp,
      deleted_by_block_timestamp,
      permission_kind,
      created_by_receipt_id,
      deleted_by_receipt_id,
      permission,
      action_timestamp
    FROM
      access_keys
    WHERE
      account_id = ${account}
      AND (
        ${cursor.timestamp}::BIGINT IS NULL
        OR action_timestamp < ${cursor.timestamp}
        OR (
          action_timestamp = ${cursor.timestamp}
          AND public_key < ${cursor.key}
        )
      )
    ORDER BY
      action_timestamp DESC,
      public_key DESC
    LIMIT
      ${limit}
  )
SELECT
  ks.public_key,
  ks.permission_kind,
  ks.permission,
  COALESCE(c.txn, '{}'::JSONB) AS created,
  COALESCE(d.txn, '{}'::JSONB) AS deleted
FROM
  keys_selected ks
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
      AND t.block_timestamp <= ks.created_by_block_timestamp
      AND t.block_timestamp > ks.created_by_block_timestamp - 300000000000 -- 5m in ns
      JOIN blocks b ON b.block_hash = t.included_in_block_hash
      AND b.block_timestamp <= ks.created_by_block_timestamp
      AND b.block_timestamp > ks.created_by_block_timestamp - 300000000000 -- 5m in ns
    WHERE
      r.included_in_block_timestamp = ks.created_by_block_timestamp
      AND r.receipt_id = ks.created_by_receipt_id
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
      AND t.block_timestamp <= ks.deleted_by_block_timestamp
      AND t.block_timestamp > ks.deleted_by_block_timestamp - 300000000000 -- 5m in ns
      JOIN blocks b ON b.block_hash = t.included_in_block_hash
      AND b.block_timestamp <= ks.deleted_by_block_timestamp
      AND b.block_timestamp > ks.deleted_by_block_timestamp - 300000000000 -- 5m in ns
    WHERE
      r.included_in_block_timestamp = ks.deleted_by_block_timestamp
      AND r.receipt_id = ks.deleted_by_receipt_id
  ) d ON TRUE
ORDER BY
  ks.action_timestamp DESC,
  ks.public_key DESC
