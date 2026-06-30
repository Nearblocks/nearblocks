SELECT
  TO_CHAR(TO_TIMESTAMP(b.date / 1e9), 'YYYY-MM-DD') AS date,
  b.blocks::INT AS blocks,
  c.chunks::INT AS chunks,
  c.shards::INT AS shards,
  c.gas_used::TEXT AS gas_used,
  b.gas_price::TEXT AS gas_price,
  (c.gas_used * b.gas_price)::TEXT AS gas_fee,
  b.total_supply::TEXT AS total_supply
FROM
  block_stats b
  LEFT JOIN chunk_stats c ON c.date = b.date
WHERE
  (
    ${date}::BIGINT IS NULL
    OR b.date = ${date}::BIGINT
  )
ORDER BY
  b.date DESC
LIMIT
  ${limit}
