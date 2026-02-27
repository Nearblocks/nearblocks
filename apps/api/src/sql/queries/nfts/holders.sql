WITH
  holders AS (
    SELECT
      account,
      COUNT(token) AS quantity
    FROM
      nft_holders
    WHERE
      contract = ${contract}
      AND quantity > 0
    GROUP BY
      account
  )
SELECT
  account,
  quantity
FROM
  holders
WHERE
  (
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
