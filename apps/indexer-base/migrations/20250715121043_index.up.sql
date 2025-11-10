ALTER TABLE execution_outcome_receipts
DROP CONSTRAINT execution_outcome_receipts_pkey;

ALTER TABLE execution_outcome_receipts
ADD CONSTRAINT execution_outcome_receipts_pkey PRIMARY KEY (
  executed_receipt_id,
  index_in_execution_outcome,
  produced_receipt_id
);

-- USING INDEX TABLESPACE execution_outcome_receipts_tbs1;
CREATE INDEX IF NOT EXISTS arid_input_data_input_to_receipt_idx ON action_receipt_input_data (input_data_id, input_to_receipt_id);

CREATE INDEX IF NOT EXISTS arod_output_data_output_from_receipt_idx ON action_receipt_output_data (output_data_id, output_from_receipt_id);

CREATE INDEX IF NOT EXISTS eor_produced_receipt_executed_receipt_idx ON execution_outcome_receipts (produced_receipt_id, executed_receipt_id);

-- TABLESPACE execution_outcome_receipts_tbs1;
CREATE INDEX IF NOT EXISTS t_converted_receipt_transaction_hash_idx ON transactions (converted_into_receipt_id, transaction_hash);
