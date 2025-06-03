SELECT
  attach_tablespace ('tbs1', 'balance_events', if_not_attached => true);

CREATE
OR REPLACE PROCEDURE move_chunks (job_id INT, config JSONB) LANGUAGE PLPGSQL AS $$
  DECLARE
    ht REGCLASS;
    lag INTERVAL;
    destination_tablespace NAME;
    index_destination_tablespace NAME;
    reorder_index REGCLASS;
    chunk REGCLASS;
    cutoff BIGINT;
  BEGIN
    SELECT jsonb_object_field_text(config, 'hypertable')::REGCLASS
      INTO STRICT ht;
    SELECT jsonb_object_field_text(config, 'lag')::INTERVAL
      INTO STRICT lag;
    SELECT jsonb_object_field_text(config, 'destination_tablespace')
      INTO STRICT destination_tablespace;
    SELECT jsonb_object_field_text(config, 'index_destination_tablespace')
      INTO index_destination_tablespace;
    SELECT jsonb_object_field_text(config, 'reorder_index')::REGCLASS
      INTO reorder_index;

    IF ht IS NULL OR lag IS NULL OR destination_tablespace IS NULL THEN
      RAISE EXCEPTION 'Config must have hypertable, lag, and destination_tablespace';
    END IF;

    IF index_destination_tablespace IS NULL THEN
      index_destination_tablespace := destination_tablespace;
    END IF;

    cutoff := (EXTRACT(EPOCH FROM now() - lag) * 1000000000)::BIGINT;

    FOR chunk IN
      SELECT
        c.oid
      FROM
        pg_class AS c
        LEFT JOIN pg_tablespace AS t ON c.reltablespace = t.oid
        JOIN pg_namespace AS n ON c.relnamespace = n.oid
        JOIN LATERAL (
          SELECT show_chunks(ht, older_than => cutoff) AS chunk
        ) AS chunks ON chunks.chunk = (n.nspname || '.' || c.relname)::REGCLASS
      WHERE
        t.spcname IS DISTINCT FROM destination_tablespace
    LOOP
      RAISE NOTICE 'Moving chunk: %', chunk::TEXT;
      PERFORM move_chunk(
        chunk => chunk,
        destination_tablespace => destination_tablespace,
        index_destination_tablespace => index_destination_tablespace,
        reorder_index => reorder_index
      );
    END LOOP;
  END;
  $$;

SELECT
  add_job (
    'move_chunks',
    '1d',
    config => '{"hypertable":"balance_events","lag":"6 months","destination_tablespace":"tbs1"}'
  );

ALTER TABLE balance_events
SET
  (
    timescaledb.compress = TRUE,
    timescaledb.compress_orderby = 'block_timestamp DESC, shard_id DESC, index_in_chunk DESC'
  );

SELECT
  add_compression_policy ('balance_events', BIGINT '604800000000000');
