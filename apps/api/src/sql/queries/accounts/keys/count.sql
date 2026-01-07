SELECT
  COUNT(account_id)
FROM
  access_keys
WHERE
  account_id = ${account}
