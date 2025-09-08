CREATE TABLE mt_meta (
  modified_at TIMESTAMP, -- meta updated
  contract TEXT NOT NULL,
  name TEXT,
  spec TEXT,
  PRIMARY KEY (contract)
);

CREATE TABLE mt_base_meta (
  decimals SMALLINT,
  copies BIGINT,
  modified_at TIMESTAMP, -- meta updated
  contract TEXT NOT NULL,
  token TEXT NOT NULL,
  name TEXT,
  symbol TEXT,
  icon TEXT,
  base_uri TEXT,
  reference TEXT,
  reference_hash TEXT,
  PRIMARY KEY (contract, token)
);

CREATE TABLE mt_token_meta (
  copies BIGINT,
  issued_at BIGINT,
  expires_at BIGINT,
  starts_at BIGINT,
  updated_at BIGINT,
  modified_at TIMESTAMP, -- meta updated
  contract TEXT NOT NULL,
  token TEXT NOT NULL,
  title TEXT,
  description TEXT,
  media TEXT,
  media_hash TEXT,
  reference TEXT,
  reference_hash TEXT,
  extra JSONB,
  PRIMARY KEY (contract, token)
);

CREATE TABLE intents_meta (
  contract TEXT NOT NULL,
  type TEXT NOT NULL,
  token TEXT
);

CREATE UNIQUE INDEX im_contract_type_token_uidx ON intents_meta (contract, type, token) NULLS NOT DISTINCT;

ALTER TABLE nft_meta
ALTER COLUMN name
DROP NOT NULL,
ALTER COLUMN symbol
DROP NOT NULL;

CREATE INDEX fm_contract_modified_idx ON ft_meta (contract)
WHERE
  modified_at IS NULL;

CREATE INDEX nm_contract_modified_idx ON nft_meta (contract)
WHERE
  modified_at IS NULL;

CREATE INDEX ntm_contract_token_modified_idx ON nft_token_meta (contract, token)
WHERE
  modified_at IS NULL;

CREATE INDEX mm_contract_modified_idx ON mt_meta (contract)
WHERE
  modified_at IS NULL;

CREATE INDEX mbm_contract_token_modified_idx ON mt_base_meta (contract, token)
WHERE
  modified_at IS NULL;

CREATE INDEX mtm_contract_token_modified_idx ON mt_token_meta (contract, token)
WHERE
  modified_at IS NULL;

CREATE TABLE errored_contracts (
  id BIGINT GENERATED ALWAYS AS IDENTITY,
  contract TEXT NOT NULL,
  type TEXT NOT NULL,
  token TEXT,
  attempts SMALLINT NOT NULL,
  PRIMARY KEY (id)
);

CREATE UNIQUE INDEX ec_contract_type_token_uidx ON errored_contracts (contract, type, token) NULLS NOT DISTINCT;

CREATE INDEX ec_contract_type_token_attempts_idx ON errored_contracts (contract, type, token) INCLUDE (attempts);
