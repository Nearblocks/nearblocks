SELECT
  account_id
FROM
  access_keys
WHERE
  public_key = ${key}
  AND deleted_by_block_timestamp IS NULL
ORDER BY
  action_timestamp DESC
LIMIT
  5
