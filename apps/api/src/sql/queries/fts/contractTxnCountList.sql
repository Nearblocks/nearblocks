SELECT
  transfers::TEXT AS count
FROM
  ft_list
WHERE
  contract = ${contract}
