SELECT
  (date / 1e9)::BIGINT AS date,
  SUM(txns)::INT AS txns,
  JSONB_AGG(
    JSONB_BUILD_OBJECT('txns', txns::INT, 'shard', shard::INT)
    ORDER BY
      shard::INT
  ) AS shards
FROM
  tps_stats
WHERE
  date >= (
    EXTRACT(
      EPOCH
      FROM
        NOW() - INTERVAL '1 month'
    ) * 1e9
  )::BIGINT
GROUP BY
  date
ORDER BY
  date DESC
