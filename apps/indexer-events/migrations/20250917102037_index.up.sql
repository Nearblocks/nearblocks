CREATE INDEX IF NOT EXISTS fe_involved_idx ON ft_events (involved_account_id);

CREATE INDEX IF NOT EXISTS fe_cause_idx ON ft_events (cause);

CREATE INDEX IF NOT EXISTS ne_involved_idx ON nft_events (involved_account_id);

CREATE INDEX IF NOT EXISTS ne_cause_idx ON nft_events (cause);

CREATE INDEX IF NOT EXISTS me_involved_idx ON mt_events (involved_account_id);

CREATE INDEX IF NOT EXISTS me_cause_idx ON mt_events (cause);
