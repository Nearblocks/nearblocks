DROP MATERIALIZED VIEW IF EXISTS ft_list;

CREATE MATERIALIZED VIEW ft_list AS
SELECT
  m.contract,
  m.name,
  m.symbol,
  m.decimals,
  m.icon,
  m.reference,
  m.price,
  m.total_supply,
  ROUND((m.price)::NUMERIC * (m.total_supply)::NUMERIC) AS onchain_market_cap,
  m.change_24h,
  m.market_cap,
  ROUND(
    (vol.amount / POWER(10, m.decimals)::NUMERIC) * m.price,
    8
  ) AS volume_24h,
  COALESCE(h.holders, 0) AS holders,
  COALESCE(ts.transfers, 0) AS transfers
FROM
  ft_meta m
  LEFT JOIN LATERAL (
    SELECT
      COUNT(*) AS holders
    FROM
      ft_holders
    WHERE
      contract = m.contract
  ) h ON true
  LEFT JOIN LATERAL (
    SELECT
      COALESCE(SUM(transfers_count), 0) AS transfers
    FROM
      ft_contract_stats
    WHERE
      contract = m.contract
  ) ts ON true
  LEFT JOIN LATERAL (
    SELECT
      COALESCE(SUM(transfers_amount), 0) AS amount
    FROM
      ft_contract_stats
    WHERE
      contract = m.contract
      AND date = (
        EXTRACT(
          epoch
          FROM
            DATE_TRUNC(
              'day',
              (NOW() AT TIME ZONE 'UTC') - INTERVAL '1 day'
            )
        ) * 1000000000
      )::BIGINT
  ) vol ON true
WHERE
  m.modified_at IS NOT NULL
WITH
  NO DATA;

CREATE UNIQUE INDEX ON ft_list (contract);
