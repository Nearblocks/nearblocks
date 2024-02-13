ALTER TABLE "errored_contracts"
DROP CONSTRAINT "errored_contracts_contract_type_key",
DROP CONSTRAINT "errored_contracts_contract_type_token_key";

CREATE UNIQUE INDEX ec_unique_contract_type ON errored_contracts (contract, type)
WHERE
  (token IS NULL);

CREATE UNIQUE INDEX ec_unique_contract_type_token ON errored_contracts (contract, type, token)
WHERE
  (token IS NOT NULL);
