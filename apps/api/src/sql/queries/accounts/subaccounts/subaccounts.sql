WITH
  accounts_selected AS (
    SELECT
      account_id,
      created_by_block_timestamp,
      deleted_by_block_timestamp,
      created_by_receipt_id,
      deleted_by_receipt_id,
      COALESCE(
        deleted_by_block_timestamp,
        created_by_block_timestamp
      ) AS action_timestamp
    FROM
      accounts
    WHERE
      parent = ${account}
      AND (
        ${cursor.timestamp}::BIGINT IS NULL
        OR (
          ${direction} = 'desc'
          AND (
            COALESCE(
              deleted_by_block_timestamp,
              created_by_block_timestamp
            ),
            account_id
          ) < (${cursor.timestamp}, ${cursor.key})
        )
        OR (
          ${direction} = 'asc'
          AND (
            COALESCE(
              deleted_by_block_timestamp,
              created_by_block_timestamp
            ),
            account_id
          ) > (${cursor.timestamp}, ${cursor.key})
        )
      )
    ORDER BY
      COALESCE(
        deleted_by_block_timestamp,
        created_by_block_timestamp
      ) ${direction:raw},
      account_id ${direction:raw}
    LIMIT
      ${limit}
  )
SELECT
  a.account_id,
  a.action_timestamp,
  COALESCE(c.txn, '{}'::JSONB) AS created,
  COALESCE(d.txn, '{}'::JSONB) AS deleted
FROM
  accounts_selected a
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
      AND t.block_timestamp <= a.created_by_block_timestamp
      AND t.block_timestamp > a.created_by_block_timestamp - 300000000000 -- 5m in ns
      JOIN blocks b ON b.block_hash = t.included_in_block_hash
      AND b.block_timestamp <= a.created_by_block_timestamp
      AND b.block_timestamp > a.created_by_block_timestamp - 300000000000 -- 5m in ns
    WHERE
      r.included_in_block_timestamp = a.created_by_block_timestamp
      AND r.receipt_id = a.created_by_receipt_id
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
      AND t.block_timestamp <= a.deleted_by_block_timestamp
      AND t.block_timestamp > a.deleted_by_block_timestamp - 300000000000 -- 5m in ns
      JOIN blocks b ON b.block_hash = t.included_in_block_hash
      AND b.block_timestamp <= a.deleted_by_block_timestamp
      AND b.block_timestamp > a.deleted_by_block_timestamp - 300000000000 -- 5m in ns
    WHERE
      r.included_in_block_timestamp = a.deleted_by_block_timestamp
      AND r.receipt_id = a.deleted_by_receipt_id
  ) d ON TRUE
ORDER BY
  a.action_timestamp ${direction:raw},
  a.account_id ${direction:raw}
