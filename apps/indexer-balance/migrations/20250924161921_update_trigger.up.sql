ALTER TABLE account_balances
ADD COLUMN IF NOT EXISTS block_timestamp BIGINT NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS shard_id SMALLINT NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS index_in_chunk INT NOT NULL DEFAULT 0;

CREATE
OR REPLACE FUNCTION update_account_balances () RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO
    account_balances (
      account,
      amount,
      amount_staked,
      storage_usage,
      block_timestamp,
      shard_id,
      index_in_chunk
    )
  SELECT DISTINCT
    ON (affected_account_id) affected_account_id,
    nonstaked_amount,
    staked_amount,
    storage_usage,
    block_timestamp,
    shard_id,
    index_in_chunk
  FROM
    new_table
  ORDER BY
    affected_account_id,
    block_timestamp DESC,
    shard_id DESC,
    index_in_chunk DESC
  ON CONFLICT (account) DO UPDATE
  SET
    amount = EXCLUDED.amount,
    amount_staked = EXCLUDED.amount_staked,
    storage_usage = EXCLUDED.storage_usage,
    block_timestamp = EXCLUDED.block_timestamp,
    shard_id = EXCLUDED.shard_id,
    index_in_chunk = EXCLUDED.index_in_chunk
  WHERE
    (
      EXCLUDED.block_timestamp,
      EXCLUDED.shard_id,
      EXCLUDED.index_in_chunk
    ) > (
      account_balances.block_timestamp,
      account_balances.shard_id,
      account_balances.index_in_chunk
    );
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;
