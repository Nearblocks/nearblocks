SELECT
  account,
  token,
  amount
FROM
  mt_holders
WHERE
  contract = ${contract}
  AND amount > 0
  AND (
    ${token}::TEXT IS NULL
    OR token = ${token}
  )
  AND (
    ${cursor.amount}::NUMERIC IS NULL
    OR (
      (
        ${direction} = 'desc'
        AND (
          amount < ${cursor.amount}
          OR (
            amount = ${cursor.amount}
            AND account > ${cursor.account}
          )
        )
      )
      OR (
        ${direction} = 'asc'
        AND (
          amount > ${cursor.amount}
          OR (
            amount = ${cursor.amount}
            AND account < ${cursor.account}
          )
        )
      )
    )
  )
ORDER BY
  amount ${direction:raw},
  account ${accountDirection:raw}
LIMIT
  ${limit}
