SELECT
  COUNT(*)
FROM
  ft_holders
WHERE
  contract = ${contract}
  AND amount > 0
