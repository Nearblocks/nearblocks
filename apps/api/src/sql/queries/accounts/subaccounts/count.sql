SELECT
  COUNT(account_id)
FROM
  accounts
WHERE
  parent = ${account}
