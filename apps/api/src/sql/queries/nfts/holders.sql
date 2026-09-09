SELECT
  account,
  quantity
FROM
  nft_account_holders
WHERE
  contract = ${contract}
  AND quantity > 0
  AND (
    ${cursor.quantity}::NUMERIC IS NULL
    OR (
      (
        ${direction} = 'desc'
        AND (
          quantity < ${cursor.quantity}
          OR (
            quantity = ${cursor.quantity}
            AND account > ${cursor.account}
          )
        )
      )
      OR (
        ${direction} = 'asc'
        AND (
          quantity > ${cursor.quantity}
          OR (
            quantity = ${cursor.quantity}
            AND account < ${cursor.account}
          )
        )
      )
    )
  )
ORDER BY
  quantity ${direction:raw},
  account ${accountDirection:raw}
LIMIT
  ${limit}
