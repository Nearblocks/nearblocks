CREATE
OR REPLACE FUNCTION count_cost_estimate (query TEXT) RETURNS TABLE (count NUMERIC, cost NUMERIC) AS $$
  DECLARE
    plan JSON;
  BEGIN
    EXECUTE FORMAT('EXPLAIN (FORMAT JSON) %s', query) INTO plan;
    count := CAST(plan -> 0 -> 'Plan' ->> 'Plan Rows' AS NUMERIC);
    cost := CAST(plan -> 0 -> 'Plan' ->> 'Total Cost' AS NUMERIC);
    RETURN NEXT;
  END;
$$ LANGUAGE PLPGSQL STRICT;

CREATE INDEX IF NOT EXISTS se_account_timestamp_shard_index_idx ON staking_events (
  account,
  block_timestamp DESC,
  shard_id DESC,
  index_in_chunk DESC
);
