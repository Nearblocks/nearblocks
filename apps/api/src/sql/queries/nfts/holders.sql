SELECT
  account,
  quantity
FROM
  nft_holders
WHERE
  contract = ${contract}
  AND quantity > 0
  AND (
    ${cursor.quantity}::NUMERIC IS NULL
    OR (
      quantity < ${cursor.quantity}
      OR (
        quantity = ${cursor.quantity}
        AND account > ${cursor.account}
      )
    )
  )
ORDER BY
  quantity DESC,
  account ASC
LIMIT
  ${limit}
