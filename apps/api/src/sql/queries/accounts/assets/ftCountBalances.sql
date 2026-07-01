WITH
  balances AS (
    SELECT
      b.contract,
      b.amount::NUMERIC AS amount
    FROM
      JSONB_TO_RECORDSET(${balances}::JSONB) AS b (contract TEXT, amount TEXT)
  )
SELECT
  COUNT(*) AS count
FROM
  balances b
  JOIN ft_meta fm ON fm.contract = b.contract
WHERE
  b.amount > 0
  AND fm.modified_at IS NOT NULL
