-- INIT (UniversalStateInit) only takes effect on an uninitialised account:
-- when the latest non-INIT event is absent or a DELETE, the first INIT after
-- it is the current code; otherwise that non-INIT event is.
WITH
  latest AS (
    SELECT
      contract_account_id,
      block_timestamp,
      shard_id,
      index_in_chunk,
      event_type,
      code_hash,
      code_base64,
      global_account_id,
      global_code_hash
    FROM
      contract_code_events
    WHERE
      contract_account_id = ${account}
      AND event_type <> 'INIT'
    ORDER BY
      block_timestamp DESC,
      shard_id DESC,
      index_in_chunk DESC
    LIMIT
      1
  ),
  init AS (
    SELECT
      c.contract_account_id,
      c.code_hash,
      c.code_base64,
      c.global_account_id,
      c.global_code_hash
    FROM
      contract_code_events c
    WHERE
      c.contract_account_id = ${account}
      AND c.event_type = 'INIT'
      AND NOT EXISTS (
        SELECT
          1
        FROM
          latest
        WHERE
          event_type <> 'DELETE'
      )
      AND c.block_timestamp >= COALESCE(
        (
          SELECT
            block_timestamp
          FROM
            latest
        ),
        0
      )
      AND NOT EXISTS (
        SELECT
          1
        FROM
          latest l
        WHERE
          (c.block_timestamp, c.shard_id, c.index_in_chunk) <= (l.block_timestamp, l.shard_id, l.index_in_chunk)
      )
    ORDER BY
      c.block_timestamp,
      c.shard_id,
      c.index_in_chunk
    LIMIT
      1
  )
SELECT
  contract_account_id AS account_id,
  code_hash,
  code_base64,
  global_account_id,
  global_code_hash
FROM
  init
UNION ALL
SELECT
  contract_account_id AS account_id,
  code_hash,
  code_base64,
  global_account_id,
  global_code_hash
FROM
  latest
WHERE
  NOT EXISTS (
    SELECT
      1
    FROM
      init
  )
