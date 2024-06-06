CREATE TABLE action_receipt_input_data (
  input_data_id TEXT NOT NULL,
  input_to_receipt_id TEXT NOT NULL,
  PRIMARY KEY (input_data_id, input_to_receipt_id)
);
