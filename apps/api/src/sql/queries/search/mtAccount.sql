SELECT
  account AS account_id
FROM
  mt_holders
WHERE
  account = ${account}
LIMIT
  1
