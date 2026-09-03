WITH
  balances AS (
    SELECT
      b.contract,
      b.amount::NUMERIC AS amount
    FROM
      JSONB_TO_RECORDSET(${balances}::JSONB) AS b (contract TEXT, amount TEXT)
  ),
  holdings AS (
    SELECT
      b.contract,
      b.amount::TEXT AS amount,
      fm.name,
      fm.symbol,
      fm.decimals,
      fm.icon,
      fm.reference,
      p.price,
      COALESCE(
        b.amount * p.price / NULLIF(POWER(10, fm.decimals)::NUMERIC, 0),
        0
      ) AS value
    FROM
      balances b
      JOIN ft_meta fm ON fm.contract = b.contract
      LEFT JOIN LATERAL (
        SELECT
          price
        FROM
          ft_prices
        WHERE
          coingecko_id = fm.coingecko_id
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
      b.amount > 0
      AND fm.modified_at IS NOT NULL
  )
SELECT
  contract,
  amount,
  value,
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
    price::TEXT
  ) AS meta
FROM
  holdings
WHERE
  (
    ${cursor.value}::NUMERIC IS NULL
    AND ${cursor.contract}::TEXT IS NULL
  )
  OR (
    ${direction} = 'desc'
    AND (
      (value < ${cursor.value}::NUMERIC)
      OR (
        value = ${cursor.value}::NUMERIC
        AND contract > ${cursor.contract}::TEXT
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
    )
  )
ORDER BY
  value ${direction:raw},
  contract ${contractDirection:raw}
LIMIT
  ${limit}
