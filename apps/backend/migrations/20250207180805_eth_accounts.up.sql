CREATE MATERIALIZED VIEW eth_accounts AS
SELECT DISTINCT
  account_id
FROM
  accounts
WHERE
  account_id ~ '^0x[0-9a-fA-F]{40}$'
ORDER BY
  account_id;

CREATE UNIQUE INDEX ON eth_accounts (account_id);
