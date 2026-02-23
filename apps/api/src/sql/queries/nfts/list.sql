SELECT
  contract,
  name,
  symbol,
  icon,
  base_uri,
  reference,
  tokens,
  holders,
  transfers_24h
FROM
  nft_list
WHERE
  (
    ${search} IS NULL
    OR contract ILIKE ${search}
    OR symbol ILIKE ${search}
    OR name ILIKE ${search}
  )
  AND (
    NOT ${has_cursor}
    OR (
      ${order} = 'desc'
      AND (
        (
          ${cursor.sort} IS NOT NULL
          AND (
            (${sort:name} < ${cursor.sort})
            OR (
              ${sort:name} = ${cursor.sort}
              AND contract > ${cursor.contract}
            )
            OR (${sort:name} IS NULL)
          )
        )
        OR (
          ${cursor.sort} IS NULL
          AND ${sort:name} IS NULL
          AND contract > ${cursor.contract}
        )
      )
    )
    OR (
      ${order} = 'asc'
      AND (
        (
          ${cursor.sort} IS NOT NULL
          AND (
            (${sort:name} > ${cursor.sort})
            OR (
              ${sort:name} = ${cursor.sort}
              AND contract > ${cursor.contract}
            )
          )
        )
        OR (
          ${cursor.sort} IS NULL
          AND (
            (
              ${sort:name} IS NULL
              AND contract > ${cursor.contract}
            )
            OR (${sort:name} IS NOT NULL)
          )
        )
      )
    )
  )
ORDER BY
  ${sort:name} ${order:raw} ${order_by:raw},
  contract ASC
LIMIT
  ${limit};
