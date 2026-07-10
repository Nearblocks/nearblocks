SELECT DISTINCT
  account_id
FROM
  access_keys
  JOIN accounts USING (account_id)
WHERE
  public_key = ${key}
  AND accounts.deleted_by_block_timestamp IS NULL
  AND access_keys.deleted_by_block_timestamp IS NULL
