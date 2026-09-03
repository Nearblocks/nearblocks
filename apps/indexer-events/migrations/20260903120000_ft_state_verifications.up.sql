CREATE TABLE ft_state_verifications (
  contract TEXT PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'pending',
  samples INT NOT NULL DEFAULT 0,
  matched INT NOT NULL DEFAULT 0,
  mismatched INT NOT NULL DEFAULT 0,
  checks INT NOT NULL DEFAULT 0,
  attempts INT NOT NULL DEFAULT 0,
  block_height BIGINT NOT NULL DEFAULT 0,
  checked_at TIMESTAMPTZ
);

CREATE INDEX fsv_rotation_idx ON ft_state_verifications (checked_at ASC NULLS FIRST)
WHERE
  status NOT IN ('mismatch', 'absent');
