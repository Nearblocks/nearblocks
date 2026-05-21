SELECT
  mbm.contract,
  mbm.token,
  mbm.name,
  mbm.symbol,
  mbm.decimals,
  mbm.icon,
  mbm.base_uri,
  mbm.copies,
  mbm.reference,
  mtm.title,
  mtm.media,
  mtm.price::TEXT,
  holder.account AS owner
FROM
  mt_base_meta mbm
  LEFT JOIN mt_token_meta mtm USING (contract, token)
  LEFT JOIN LATERAL (
    SELECT
      account
    FROM
      mt_holders
    WHERE
      contract = mbm.contract
      AND token = mbm.token
      AND amount > 0
    LIMIT
      1
  ) holder ON TRUE
WHERE
  mbm.contract = ${contract}
  AND mbm.modified_at IS NOT NULL
  AND mbm.decimals IS NOT NULL
  AND (
    ${cursor.token}::TEXT IS NULL
    OR (
      ${direction} = 'desc'
      AND (
        (
          ${cursor.price}::TEXT IS NOT NULL
          AND (
            (mtm.price < ${cursor.price}::NUMERIC)
            OR (
              mtm.price = ${cursor.price}::NUMERIC
              AND mbm.token > ${cursor.token}
            )
            OR mtm.price IS NULL
          )
        )
        OR (
          ${cursor.price}::TEXT IS NULL
          AND mtm.price IS NULL
          AND mbm.token > ${cursor.token}
        )
      )
    )
    OR (
      ${direction} = 'asc'
      AND (
        (
          ${cursor.price}::TEXT IS NOT NULL
          AND (
            (mtm.price > ${cursor.price}::NUMERIC)
            OR (
              mtm.price = ${cursor.price}::NUMERIC
              AND mbm.token < ${cursor.token}
            )
          )
        )
        OR (
          ${cursor.price}::TEXT IS NULL
          AND (
            mtm.price IS NOT NULL
            OR (
              mtm.price IS NULL
              AND mbm.token < ${cursor.token}
            )
          )
        )
      )
    )
  )
ORDER BY
  mtm.price ${direction:raw} NULLS ${nullsOrder:raw},
  mbm.token ${tokenDirection:raw}
LIMIT
  ${limit}
