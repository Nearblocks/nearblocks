WITH
  holdings AS (
    SELECT
      fh.contract,
      fh.amount,
      fm.name,
      fm.symbol,
      fm.decimals,
      fm.icon,
      fm.reference,
      p.price,
      COALESCE(
        fh.amount * p.price / NULLIF(POWER(10, fm.decimals)::NUMERIC, 0),
        0
      ) AS value
    FROM
      ft_holders fh
      JOIN ft_meta fm ON fm.contract = fh.contract
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
      fh.account = ${account}
      AND fh.amount > 0
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
  OR (value < ${cursor.value}::NUMERIC)
  OR (
    value = ${cursor.value}::NUMERIC
    AND contract > ${cursor.contract}::TEXT
  )
ORDER BY
  value DESC,
  contract ASC
LIMIT
  ${limit}
