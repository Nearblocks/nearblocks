WITH
  holdings AS (
    SELECT
      mh.contract,
      mh.token,
      mh.amount,
      mbm.name,
      mbm.symbol,
      mbm.decimals,
      mbm.icon,
      mbm.reference,
      mbm.base_uri,
      mtm.title,
      mtm.media,
      mtm.reference AS token_reference,
      p.price,
      COALESCE(
        mh.amount * p.price / NULLIF(POWER(10, mbm.decimals)::NUMERIC, 0),
        0
      ) AS value
    FROM
      mt_holders mh
      JOIN mt_base_meta mbm ON mbm.contract = mh.contract
      AND mbm.token = mh.token
      AND mbm.modified_at IS NOT NULL
      AND mbm.decimals IS NOT NULL
      JOIN mt_token_meta mtm ON mtm.contract = mh.contract
      AND mtm.token = mh.token
      AND mtm.modified_at IS NOT NULL
      LEFT JOIN mt_intents_tokens it ON it.token = mh.token
      LEFT JOIN LATERAL (
        SELECT
          price
        FROM
          ft_prices
        WHERE
          coingecko_id = it.coingecko_id
          AND date >= (
            EXTRACT(
              EPOCH
              FROM
                NOW()
            ) * 1000
          )::BIGINT - 600000
        ORDER BY
          date DESC
        LIMIT
          1
      ) p ON TRUE
    WHERE
      mh.account = ${account}
      AND mh.amount > 0
      AND (
        ${contract}::TEXT IS NULL
        OR mh.contract = ${contract}
      )
      AND (
        ${token}::TEXT IS NULL
        OR mh.token = ${token}
      )
  )
SELECT
  contract,
  token,
  amount,
  value,
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
    'icon',
    icon,
    'reference',
    reference,
    'base_uri',
    base_uri
  ) AS meta,
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
    token_reference,
    'price',
    price::TEXT
  ) AS token_meta
FROM
  holdings
WHERE
  (
    ${cursor.value}::NUMERIC IS NULL
    AND ${cursor.contract}::TEXT IS NULL
    AND ${cursor.token}::TEXT IS NULL
  )
  OR (
    ${direction} = 'desc'
    AND (
      (value < ${cursor.value}::NUMERIC)
      OR (
        value = ${cursor.value}::NUMERIC
        AND contract > ${cursor.contract}::TEXT
      )
      OR (
        value = ${cursor.value}::NUMERIC
        AND contract = ${cursor.contract}::TEXT
        AND token > ${cursor.token}::TEXT
      )
    )
  )
  OR (
    ${direction} = 'asc'
    AND (
      (value > ${cursor.value}::NUMERIC)
      OR (
        value = ${cursor.value}::NUMERIC
        AND contract < ${cursor.contract}::TEXT
      )
      OR (
        value = ${cursor.value}::NUMERIC
        AND contract = ${cursor.contract}::TEXT
        AND token < ${cursor.token}::TEXT
      )
    )
  )
ORDER BY
  value ${direction:raw},
  contract ${contractDirection:raw},
  token ${tokenDirection:raw}
LIMIT
  ${limit}
