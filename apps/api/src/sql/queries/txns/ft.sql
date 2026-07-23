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
            WHEN (${block_timestamp}::BIGINT / 1000000 / 86400000) = (
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
                AND date <= ${block_timestamp}::BIGINT / 1000000
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
                AND date <= ${block_timestamp}::BIGINT / 1000000
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
  ft.receipt_id = ${receipt_id}::TEXT
  AND ft.block_timestamp <= ${block_timestamp}::BIGINT
  AND ft.block_timestamp >= ${block_timestamp}::BIGINT - 300000000000 -- 5m in ns
