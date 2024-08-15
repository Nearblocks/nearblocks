ALTER TABLE action_receipt_actions
ADD COLUMN IF NOT EXISTS nep518_rlp_hash text NULL;

CREATE INDEX IF NOT EXISTS ara_nep518_rlp_hash ON action_receipt_actions (nep518_rlp_hash)
WHERE
  nep518_rlp_hash IS NOT NULL;
