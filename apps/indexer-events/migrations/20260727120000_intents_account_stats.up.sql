CREATE TABLE IF NOT EXISTS mt_intents_accounts (
  date BIGINT NOT NULL, -- day bucket, epoch ms
  account_id TEXT NOT NULL,
  PRIMARY KEY (date, account_id)
);

CREATE TABLE IF NOT EXISTS mt_intents_account_stats (
  date BIGINT NOT NULL, -- day bucket, epoch ms
  accounts INT NOT NULL,
  PRIMARY KEY (date)
);
