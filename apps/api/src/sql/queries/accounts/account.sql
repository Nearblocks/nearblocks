WITH
  account_selected AS (
    SELECT
      account_id,
      created_by_block_timestamp,
      deleted_by_block_timestamp,
      created_by_receipt_id,
      deleted_by_receipt_id
    FROM
      accounts
    WHERE
      account_id = ${account}
    LIMIT
      1
  )
SELECT
  ac.account_id,
  COALESCE(c.created, '{}'::JSONB) AS created,
  COALESCE(d.deleted, '{}'::JSONB) AS deleted,
  CASE
    WHEN NOT EXISTS (
      SELECT
        1
      FROM
        access_keys
      WHERE
        account_id = ${account}
        AND permission_kind = 'FULL_ACCESS'
        AND deleted_by_block_timestamp IS NULL
    ) THEN TRUE
    ELSE FALSE
  END AS locked
FROM
  account_selected ac
  LEFT JOIN LATERAL (
    SELECT
      JSONB_BUILD_OBJECT(
        'transaction_hash',
        t.transaction_hash,
        'block_timestamp',
        t.block_timestamp::TEXT
      ) AS created
    FROM
      receipts r
      LEFT JOIN transactions t ON t.transaction_hash = r.originated_from_transaction_hash
    WHERE
      r.included_in_block_timestamp = (
        SELECT
          a.created_by_block_timestamp
        FROM
          account_selected a
      )
      AND t.block_timestamp <= (
        SELECT
          a.created_by_block_timestamp
        FROM
          account_selected a
      )
      AND t.block_timestamp >= (
        SELECT
          a.created_by_block_timestamp - 300000000000 -- 5m in ns
        FROM
          account_selected a
      )
      AND r.receipt_id = ac.created_by_receipt_id
  ) c ON TRUE
  LEFT JOIN LATERAL (
    SELECT
      JSONB_BUILD_OBJECT(
        'transaction_hash',
        t.transaction_hash,
        'block_timestamp',
        t.block_timestamp::TEXT
      ) AS deleted
    FROM
      receipts r
      LEFT JOIN transactions t ON t.transaction_hash = r.originated_from_transaction_hash
    WHERE
      r.included_in_block_timestamp = (
        SELECT
          a.deleted_by_block_timestamp
        FROM
          account_selected a
      )
      AND t.block_timestamp <= (
        SELECT
          a.deleted_by_block_timestamp
        FROM
          account_selected a
      )
      AND t.block_timestamp >= (
        SELECT
          a.deleted_by_block_timestamp - 300000000000 -- 5m in ns
        FROM
          account_selected a
      )
      AND r.receipt_id = ac.deleted_by_receipt_id
  ) d ON TRUE
