SELECT
  fh.amount
FROM
  ft_holders fh
WHERE
  fh.account = ${account}
  AND fh.contract = ${contract}
