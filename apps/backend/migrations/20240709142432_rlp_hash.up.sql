ALTER TABLE action_receipt_actions
ADD rlp_hash text NULL;

CREATE INDEX IF NOT EXISTS ara_rlp_hash ON action_receipt_actions (rlp_hash)
WHERE
  rlp_hash IS NOT NULL;
