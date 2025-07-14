SELECT
  account AS account_id,
  amount,
  amount_staked,
  storage_usage
FROM
  account_balances
WHERE
  account = ${account}
LIMIT
  1
