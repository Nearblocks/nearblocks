SELECT
  (
    SELECT
      COALESCE(SUM(txns), 0)
    FROM
      signer_txn_stats
  )::TEXT AS txns,
  (
    SELECT
      COALESCE(SUM(gas_burnt), 0)
    FROM
      signer_gas_stats
  )::TEXT AS gas_burnt
