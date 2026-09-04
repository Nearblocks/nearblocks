SELECT
  holders::TEXT AS count
FROM
  ft_list
WHERE
  contract = ${contract}
