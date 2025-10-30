SELECT
  COUNT(fh.account)
FROM
  ft_holders fh
  JOIN ft_meta fm ON fm.contract = fh.contract
WHERE
  fh.account = ${account}
  AND fh.amount > 0
