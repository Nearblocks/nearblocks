SELECT
  contract,
  name,
  symbol,
  decimals,
  icon,
  reference,
  price,
  total_supply,
  onchain_market_cap,
  change_24h,
  market_cap,
  volume_24h,
  holders
FROM
  ft_list
WHERE
  (
    ${search} IS NULL
    OR contract ILIKE ${search}
    OR symbol ILIKE ${search}
    OR name ILIKE ${search}
  )
  AND (
    ${cursor.sort} IS NULL
    OR (
      ${order} = 'desc'
      AND (
        (${sort:name} < ${cursor.sort})
        OR (
          ${sort:name} = ${cursor.sort}
          AND contract > ${cursor.contract}
        )
      )
    )
    OR (
      ${order} = 'asc'
      AND (
        (${sort:name} > ${cursor.sort})
        OR (
          ${sort:name} = ${cursor.sort}
          AND contract > ${cursor.contract}
        )
      )
    )
  )
ORDER BY
  ${sort:name} ${order:raw} ${order_by:raw},
  contract ASC
LIMIT
  ${limit};
