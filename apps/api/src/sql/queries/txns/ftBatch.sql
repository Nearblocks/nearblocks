-- Batched variant of ft.sql.
--
-- ft.sql is formatted once per receipt and the branches joined with UNION ALL,
-- so a transaction with N receipts runs N separate scans. ft_events has no
-- index on receipt_id, so each branch scans the 5-minute timestamp window and
-- filters: measured at 3,885 rows discarded to find 2, 1,017 buffers, 3.6ms
-- per branch. At ~34 branches that is the 122ms mean pg_stat_statements shows.
--
-- Every receipt of one transaction falls inside the same 5-minute window by
-- construction -- that is what the bound below is for -- so one window covering
-- all of them reads those rows once and filters by the id set, instead of
-- repeating the scan per receipt. receipt_id is the real filter; the timestamp
-- bound only exists to prune chunks.
--
-- The price lookup now follows ft.block_timestamp rather than a per-branch
-- parameter. For a given receipt those are the same block, so values are
-- unchanged.

SELECT
  ft.receipt_id,
  ft.contract_account_id,
  ft.affected_account_id,
  ft.involved_account_id,
  ft.cause,
  ft.delta_amount,
  ft.block_timestamp,
  ft.shard_id,
  ft.event_type,
  ft.event_index,
  m.meta
FROM
  ft_events ft
  JOIN LATERAL (
    SELECT
      JSONB_BUILD_OBJECT(
        'contract',
        contract,
        'name',
        name,
        'symbol',
        symbol,
        'decimals',
        decimals,
        'icon',
        icon,
        'reference',
        reference,
        'price',
        (
          CASE
            WHEN (ft.block_timestamp / 1000000 / 86400000) = (
              EXTRACT(
                EPOCH
                FROM
                  NOW()
              )::BIGINT * 1000 / 86400000
            ) THEN (
              SELECT
                price
              FROM
                ft_prices
              WHERE
                coingecko_id = fm.coingecko_id
                AND date <= ft.block_timestamp / 1000000
              ORDER BY
                date DESC
              LIMIT
                1
            )
            ELSE (
              SELECT
                price
              FROM
                ft_prices_daily
              WHERE
                coingecko_id = fm.coingecko_id
                AND date <= ft.block_timestamp / 1000000
              ORDER BY
                date DESC
              LIMIT
                1
            )
          END
        )::TEXT
      ) AS meta
    FROM
      ft_meta fm
    WHERE
      fm.contract = ft.contract_account_id
      AND fm.modified_at IS NOT NULL
  ) m ON TRUE
WHERE
  ft.receipt_id = ANY (${receipt_ids}::TEXT[])
  AND ft.block_timestamp <= ${max_timestamp}::BIGINT
  AND ft.block_timestamp >= ${min_timestamp}::BIGINT - 300000000000 -- 5m in ns
