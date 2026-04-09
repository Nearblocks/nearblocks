SELECT
  COUNT(*)::INTEGER AS txns,
  COUNT(DISTINCT account_id)::INTEGER AS accounts,
  COUNT(DISTINCT tx_address)::INTEGER AS addresses,
  COUNT(DISTINCT tx_chain)::INTEGER AS chains
FROM
  signatures
WHERE
  block_timestamp >= (
    EXTRACT(
      EPOCH
      FROM
        NOW()
    ) * 1e9 - 86400000000000
  )::BIGINT;
