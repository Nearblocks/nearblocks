SELECT
  account,
  amount
FROM
  ft_holders
WHERE
  contract = ${contract}
  AND amount > 0
  AND (
    ${cursor.amount}::NUMERIC IS NULL
    OR (
      amount < ${cursor.amount}
      OR (
        amount = ${cursor.amount}
        AND account > ${cursor.account}
      )
    )
  )
ORDER BY
  amount DESC,
  account ASC
LIMIT
  ${limit}
