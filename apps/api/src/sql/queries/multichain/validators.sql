SELECT
  account_id
FROM
  validator_epoch_data
WHERE
  account_id = ANY (${account_ids})
