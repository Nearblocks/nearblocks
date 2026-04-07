CREATE
OR REPLACE FUNCTION epoch_nano_seconds () RETURNS BIGINT AS $$ -- epoch in ns
  SELECT EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::BIGINT * 1000 * 1000 * 1000;
$$ LANGUAGE SQL STABLE;

SELECT
  set_integer_now_func ('multichain_signatures', 'epoch_nano_seconds',);

SELECT
  set_integer_now_func ('multichain_transactions', 'epoch_nano_seconds',);

SELECT
  set_integer_now_func ('signatures', 'epoch_nano_seconds',);

SELECT
  set_chunk_time_interval (
    'multichain_signatures',
    BIGINT '86400000000000' -- 1d in ns
  );

SELECT
  add_retention_policy (
    'multichain_signatures',
    drop_after => BIGINT '604800000000000' -- 7 days in ns
  );

SELECT
  set_chunk_time_interval (
    'multichain_transactions',
    BIGINT '86400000000000' -- 1d in ns
  );

SELECT
  add_retention_policy (
    'multichain_transactions',
    drop_after => BIGINT '604800000000000' -- 7 days in ns
  );

ALTER TABLE multichain_signatures
ADD COLUMN IF NOT EXISTS status TEXT NULL;

CREATE INDEX IF NOT EXISTS ms_unmatched_idx ON multichain_signatures (block_timestamp ASC, event_index ASC)
WHERE
  status IS NULL;

CREATE TABLE IF NOT EXISTS signatures (
  block_timestamp BIGINT NOT NULL,
  event_index INT NOT NULL,
  receipt_id TEXT NOT NULL,
  account_id TEXT NOT NULL,
  public_key TEXT NOT NULL,
  path TEXT,
  scheme TEXT,
  signature BYTEA,
  r BYTEA,
  s BYTEA,
  v BIGINT,
  tx_timestamp BIGINT NOT NULL,
  tx_chain TEXT NOT NULL,
  tx_hash TEXT NOT NULL,
  tx_address TEXT NOT NULL
);

SELECT
  create_hypertable (
    'signatures',
    by_range ('block_timestamp', BIGINT '2592000000000000'), -- 30d in ns
    create_default_indexes => false,
    if_not_exists => true
  );

CREATE UNIQUE INDEX IF NOT EXISTS s_receipt_chain_hash_uidx ON signatures (
  receipt_id,
  block_timestamp DESC,
  event_index DESC
);

CREATE INDEX IF NOT EXISTS s_block_timestamp_idx ON signatures (block_timestamp DESC, event_index DESC);

CREATE INDEX IF NOT EXISTS s_account_timestamp_idx ON signatures (
  account_id,
  block_timestamp DESC,
  event_index DESC
);

CREATE INDEX IF NOT EXISTS s_chain_idx ON signatures (tx_chain);

CREATE INDEX IF NOT EXISTS s_hash_idx ON signatures (tx_hash);

CREATE INDEX IF NOT EXISTS s_address_idx ON signatures (tx_address);

CREATE
OR REPLACE FUNCTION match_signatures () RETURNS TABLE (matched_count INT, processed_count INT) LANGUAGE plpgsql AS $$
DECLARE
  sig RECORD;
  matched INT := 0;
  processed INT := 0;
  is_found BOOLEAN;
BEGIN
  FOR sig IN
    SELECT *
    FROM multichain_signatures ms
    WHERE status IS NULL
    ORDER BY block_timestamp ASC, event_index ASC
  LOOP
    processed := processed + 1;
    is_found := FALSE;

    IF sig.signature IS NOT NULL THEN
      INSERT INTO signatures (
        block_timestamp,
        event_index,
        receipt_id,
        account_id,
        public_key,
        path,
        scheme,
        signature,
        r,
        s,
        v,
        tx_timestamp,
        tx_chain,
        tx_hash,
        tx_address
      )
      SELECT
        sig.block_timestamp,
        sig.event_index,
        sig.receipt_id,
        sig.account_id,
        sig.public_key,
        sig.path,
        sig.scheme,
        sig.signature,
        sig.r,
        sig.s,
        sig.v,
        mt.timestamp,
        mt.chain,
        mt.transaction,
        mt.address
      FROM multichain_transactions mt
      WHERE mt.signature = sig.signature
      ON CONFLICT (receipt_id, block_timestamp, event_index) DO NOTHING;

      IF FOUND THEN
        is_found := TRUE;
      END IF;
    END IF;

    IF sig.r IS NOT NULL AND sig.s IS NOT NULL THEN
      INSERT INTO signatures (
        block_timestamp,
        event_index,
        receipt_id,
        account_id,
        public_key,
        path,
        scheme,
        signature,
        r,
        s,
        v,
        tx_timestamp,
        tx_chain,
        tx_hash,
        tx_address
      )
      SELECT
        sig.block_timestamp,
        sig.event_index,
        sig.receipt_id,
        sig.account_id,
        sig.public_key,
        sig.path,
        sig.scheme,
        sig.signature,
        sig.r,
        sig.s,
        sig.v,
        mt.timestamp,
        mt.chain,
        mt.transaction,
        mt.address
      FROM multichain_transactions mt
      WHERE mt.r = sig.r
        AND mt.s = sig.s
      ON CONFLICT (receipt_id, block_timestamp, event_index) DO NOTHING;

      IF FOUND THEN
        is_found := TRUE;
      END IF;
    END IF;

    IF is_found THEN
      UPDATE multichain_signatures
      SET status = 'matched'::TEXT
      WHERE receipt_id = sig.receipt_id
        AND block_timestamp = sig.block_timestamp
        AND event_index = sig.event_index;
      matched := matched + 1;
    END IF;
  END LOOP;

  matched_count := matched;
  processed_count := processed;
  RETURN NEXT;
END;
$$;

CREATE
OR REPLACE PROCEDURE match_signatures_job (job_id INT, config jsonb) LANGUAGE plpgsql AS $$
BEGIN
  PERFORM match_signatures();
END;
$$;

SELECT
  add_job ('match_signatures_job', '1 minute');

CREATE
OR REPLACE FUNCTION expire_signatures () RETURNS INT LANGUAGE plpgsql AS $$
DECLARE
  cutoff BIGINT;
  expired_count INT;
BEGIN
  cutoff := (EXTRACT(EPOCH FROM NOW()) * 1000000000)::BIGINT - 604800000000000; -- now - 7 days in ns
  UPDATE multichain_signatures
  SET status = 'expired'::TEXT
  WHERE status IS NULL
    AND block_timestamp < cutoff;

  GET DIAGNOSTICS expired_count = ROW_COUNT;
  RETURN expired_count;
END;
$$;

CREATE
OR REPLACE PROCEDURE expire_signatures_job (job_id INT, config jsonb) LANGUAGE plpgsql AS $$
BEGIN
  PERFORM expire_signatures();
END;
$$;

SELECT
  add_job ('expire_signatures_job', '1 hour');
