CREATE INDEX IF NOT EXISTS t_a_created_by_receipt_id ON accounts (created_by_receipt_id);

CREATE INDEX IF NOT EXISTS t_a_deleted_by_receipt_id ON accounts (deleted_by_receipt_id);
