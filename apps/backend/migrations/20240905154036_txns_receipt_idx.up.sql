CREATE INDEX IF NOT EXISTS r_receiver_account_id_id_desc ON receipts (receiver_account_id, id DESC);

CREATE INDEX IF NOT EXISTS r_predecessor_account_id_id_desc ON receipts (predecessor_account_id, id DESC);

CREATE INDEX IF NOT EXISTS t_receiver_account_id_id_desc ON transactions (receiver_account_id, id DESC);

CREATE INDEX IF NOT EXISTS t_signer_account_id_id_desc ON transactions (signer_account_id, id DESC);
