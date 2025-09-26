CREATE INDEX IF NOT EXISTS r_originated_from_transaction_hash_timestamp_idx ON receipts (
  originated_from_transaction_hash,
  included_in_block_timestamp DESC
);

ALTER TABLE accounts
ADD COLUMN IF NOT EXISTS parent TEXT;

ALTER TABLE accounts
ADD COLUMN IF NOT EXISTS search TSVECTOR;

CREATE
OR REPLACE FUNCTION update_account_search () RETURNS TRIGGER AS $$
BEGIN
  UPDATE accounts a
  SET
    search = to_tsvector ('english', coalesce(n.account_id, '')),
    parent = CASE
      WHEN strpos (n.account_id, '.') > 0 THEN substring(
      n.account_id
        FROM
          strpos (n.account_id, '.') + 1
      )
      ELSE NULL
    END
  FROM
    new_table n
  WHERE
    a.account_id = n.account_id;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER account_search_trigger
AFTER INSERT ON accounts REFERENCING NEW TABLE AS new_table FOR EACH STATEMENT
EXECUTE FUNCTION update_account_search ();

CREATE INDEX IF NOT EXISTS a_parent_account_idx ON accounts (parent, account_id);

CREATE INDEX IF NOT EXISTS a_search_idx ON accounts USING gin (search);
