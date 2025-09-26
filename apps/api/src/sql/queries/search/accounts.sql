SELECT
  account_id
FROM
  accounts
WHERE
  account_id = ${account}
  OR search @@ TO_TSQUERY(${account} || ':*')
ORDER BY
  account_id
LIMIT
  5
