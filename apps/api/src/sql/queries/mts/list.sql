SELECT
  contract,
  token,
  name,
  symbol,
  decimals,
  icon,
  base_uri,
  reference,
  price,
  holders,
  transfers
FROM
  mt_list
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
              AND (
                contract > ${cursor.contract}
                OR (
                  contract = ${cursor.contract}
                  AND token > ${cursor.token}
                )
              )
            )
            OR (${sort:name} IS NULL)
          )
        )
        OR (
          ${cursor.sort} IS NULL
          AND ${sort:name} IS NULL
          AND (
            contract > ${cursor.contract}
            OR (
              contract = ${cursor.contract}
              AND token > ${cursor.token}
            )
          )
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
              AND (
                contract > ${cursor.contract}
                OR (
                  contract = ${cursor.contract}
                  AND token > ${cursor.token}
                )
              )
            )
          )
        )
        OR (
          ${cursor.sort} IS NULL
          AND (
            (
              ${sort:name} IS NULL
              AND (
                contract > ${cursor.contract}
                OR (
                  contract = ${cursor.contract}
                  AND token > ${cursor.token}
                )
              )
            )
            OR (${sort:name} IS NOT NULL)
          )
        )
      )
    )
  )
ORDER BY
  ${sort:name} ${order:raw} ${order_by:raw},
  contract ASC,
  token ASC
LIMIT
  ${limit};
