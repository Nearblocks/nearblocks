-- An INIT counts only if it took effect: the account's previous event (at any
-- time) is absent or a DELETE. Repeat inits on a live account are skipped.
SELECT
  c.block_timestamp,
  c.receipt_id
FROM
  contract_code_events c
WHERE
  c.contract_account_id = ${account}
  AND c.block_timestamp >= ${start} -- rolling window start
  AND c.block_timestamp <= ${end} -- rolling window end
  AND (
    c.event_type <> 'INIT'
    OR COALESCE(
      (
        SELECT
          p.event_type
        FROM
          contract_code_events p
        WHERE
          p.contract_account_id = c.contract_account_id
          AND p.block_timestamp <= c.block_timestamp
          AND (p.block_timestamp, p.shard_id, p.index_in_chunk) < (c.block_timestamp, c.shard_id, c.index_in_chunk)
        ORDER BY
          p.block_timestamp DESC,
          p.shard_id DESC,
          p.index_in_chunk DESC
        LIMIT
          1
      ),
      'DELETE'
    ) = 'DELETE'
  )
ORDER BY
  c.block_timestamp ${order:raw},
  c.shard_id ${order:raw},
  c.index_in_chunk ${order:raw}
LIMIT
  1
