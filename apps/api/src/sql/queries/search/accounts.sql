SELECT
  account_id
FROM
  accounts
WHERE
  account_id LIKE REPLACE(${account}, '_', '\_') || '%'
ORDER BY
  (account_id = ${account}) DESC,
  (
    account_id LIKE REPLACE(${account}, '_', '\_') || '.%'
  ) DESC,
  LENGTH(account_id) ASC,
  account_id ASC
LIMIT
  5
