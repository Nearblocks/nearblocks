SELECT
  SUM(COALESCE(volume_usd, 0)) AS volume_usd,
  SUM(swaps) AS swaps,
  SUM(COALESCE(fee_usd, 0)) AS fee_usd,
  COUNT(DISTINCT token_id) AS tokens,
  COUNT(DISTINCT blockchain) AS blockchains
FROM
  mt_intents_stats
