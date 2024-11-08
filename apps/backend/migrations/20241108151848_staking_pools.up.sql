CREATE MATERIALIZED VIEW staking_pools AS
SELECT
  account_id
FROM
  accounts
WHERE
  account_id LIKE ANY (
    ARRAY[
      '%.poolv1.near',
      '%.pool.near',
      '%.pool.%.m0',
      '%.factory01.littlefarm.testnet',
      '%.factory.colorpalette.testnet'
    ]
  );

CREATE UNIQUE INDEX ON staking_pools (account_id);
