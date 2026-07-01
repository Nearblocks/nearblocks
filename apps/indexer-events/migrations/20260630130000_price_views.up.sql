DROP MATERIALIZED VIEW IF EXISTS ft_list;

CREATE MATERIALIZED VIEW ft_list AS
SELECT
  m.contract,
  m.name,
  m.symbol,
  m.decimals,
  m.icon,
  m.reference,
  lp.price,
  m.total_supply,
  ROUND((lp.price)::NUMERIC * (m.total_supply)::NUMERIC) AS onchain_market_cap,
  m.change_24h,
  m.market_cap,
  ROUND(
    (vol.amount / POWER(10, m.decimals)::NUMERIC) * lp.price,
    8
  ) AS volume_24h,
  COALESCE(h.holders, 0) AS holders,
  COALESCE(ts.transfers, 0) AS transfers
FROM
  ft_meta m
  LEFT JOIN LATERAL (
    SELECT
      price
    FROM
      ft_prices
    WHERE
      coingecko_id = m.coingecko_id
      AND date >= (
        EXTRACT(
          EPOCH
          FROM
            NOW()
        ) * 1000
      )::BIGINT - 600000
    ORDER BY
      date DESC
    LIMIT
      1
  ) lp ON true
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

DROP MATERIALIZED VIEW IF EXISTS mt_list;

CREATE MATERIALIZED VIEW mt_list AS
SELECT
  b.contract,
  b.token,
  b.name,
  b.symbol,
  b.decimals,
  b.icon,
  b.base_uri,
  b.reference,
  p.price,
  COALESCE(h.holders, 0) AS holders,
  COALESCE(ts.transfers, 0) AS transfers
FROM
  mt_base_meta b
  LEFT JOIN mt_intents_tokens it ON it.token = b.token
  LEFT JOIN LATERAL (
    SELECT
      price
    FROM
      ft_prices
    WHERE
      coingecko_id = it.coingecko_id
      AND date >= (
        EXTRACT(
          EPOCH
          FROM
            NOW()
        ) * 1000
      )::BIGINT - 600000
    ORDER BY
      date DESC
    LIMIT
      1
  ) p ON true
  LEFT JOIN LATERAL (
    SELECT
      COUNT(*) AS holders
    FROM
      mt_holders
    WHERE
      contract = b.contract
      AND token = b.token
  ) h ON true
  LEFT JOIN LATERAL (
    SELECT
      COALESCE(SUM(transfers_count), 0) AS transfers
    FROM
      mt_token_stats
    WHERE
      contract = b.contract
      AND token = b.token
  ) ts ON true
WHERE
  b.modified_at IS NOT NULL
  AND b.decimals IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS mt_list_contract_token_idx ON mt_list (contract, token);
