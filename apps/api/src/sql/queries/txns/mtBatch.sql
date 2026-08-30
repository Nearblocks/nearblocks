-- Batched variant of mt.sql. See ftBatch.sql for the measurements.
--
-- mt.sql was formatted once per receipt and the branches joined with UNION
-- ALL, so N receipts meant N scans. mt_events has no index on receipt_id, so
-- each branch scans the 5-minute window and filters. Every receipt of a
-- transaction shares that window, so one query over the combined range reads
-- those rows once and filters by the id set.
--
-- The price lookup now follows mt.block_timestamp rather than a per-branch
-- parameter. An event and the receipt that emitted it are in the same block,
-- so values are unchanged.

SELECT
  mt.receipt_id,
  mt.contract_account_id,
  mt.affected_account_id,
  mt.involved_account_id,
  mt.token_id,
  mt.cause,
  mt.delta_amount,
  mt.block_timestamp,
  mt.shard_id,
  mt.event_index,
  m.meta,
  bm.base_meta,
  tm.token_meta
FROM
  mt_events mt
  JOIN LATERAL (
    SELECT
      JSONB_BUILD_OBJECT('contract', contract, 'name', name, 'spec', spec) AS meta
    FROM
      mt_meta mm
    WHERE
      mm.contract = mt.contract_account_id
  ) m ON TRUE
  JOIN LATERAL (
    SELECT
      JSONB_BUILD_OBJECT(
        'contract',
        contract,
        'token',
        token,
        'name',
        name,
        'symbol',
        symbol,
        'decimals',
        decimals,
        'base_uri',
        base_uri,
        'icon',
        icon,
        'reference',
        reference,
        'price',
        (
          SELECT
            (
              CASE
                WHEN (mt.block_timestamp / 1000000 / 86400000) = (
                  EXTRACT(
                    EPOCH
                    FROM
                      NOW()
                  )::BIGINT * 1000 / 86400000
                ) THEN (
                  SELECT
                    price
                  FROM
                    ft_prices fp
                  WHERE
                    fp.coingecko_id = it.coingecko_id
                    AND fp.date <= mt.block_timestamp / 1000000
                  ORDER BY
                    fp.date DESC
                  LIMIT
                    1
                )
                ELSE (
                  SELECT
                    price
                  FROM
                    ft_prices_daily fpd
                  WHERE
                    fpd.coingecko_id = it.coingecko_id
                    AND fpd.date <= mt.block_timestamp / 1000000
                  ORDER BY
                    fpd.date DESC
                  LIMIT
                    1
                )
              END
            )::TEXT
          FROM
            mt_intents_tokens it
          WHERE
            it.token = mbm.token
        )
      ) AS base_meta
    FROM
      mt_base_meta mbm
    WHERE
      mbm.contract = mt.contract_account_id
      AND mbm.token = mt.token_id
      AND mbm.modified_at IS NOT NULL
  ) bm ON TRUE
  JOIN LATERAL (
    SELECT
      JSONB_BUILD_OBJECT(
        'contract',
        contract,
        'token',
        token,
        'title',
        title,
        'media',
        media,
        'reference',
        reference
      ) AS token_meta
    FROM
      mt_token_meta mtm
    WHERE
      mtm.contract = mt.contract_account_id
      AND mtm.token = mt.token_id
      AND mtm.modified_at IS NOT NULL
  ) tm ON TRUE
WHERE
  mt.receipt_id = ANY (${receipt_ids}::TEXT[])
  AND mt.block_timestamp <= ${max_timestamp}::BIGINT
  AND mt.block_timestamp >= ${min_timestamp}::BIGINT - 300000000000 -- 5m in ns
