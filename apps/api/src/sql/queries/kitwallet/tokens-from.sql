SELECT
  contract_account_id
FROM
  ft_events
WHERE
  affected_account_id = ${account}
  AND block_timestamp > ${from}
  AND block_timestamp <= ${last}
GROUP BY
  contract_account_id
