CREATE TYPE contract_verification_status AS ENUM('PENDING', 'SUCCESS', 'FAILURE');

CREATE TABLE contract_verifications (
  id BIGSERIAL NOT NULL,
  contract TEXT NOT NULL,
  status contract_verification_status DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

CREATE INDEX contract_verifications_contract_idx ON contract_verifications USING btree (contract);
