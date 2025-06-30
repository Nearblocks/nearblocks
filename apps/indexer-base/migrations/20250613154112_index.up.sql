CREATE
OR REPLACE FUNCTION count_cost_estimate (query TEXT) RETURNS TABLE (count NUMERIC, cost NUMERIC) AS $$
  DECLARE
    plan JSON;
  BEGIN
    EXECUTE FORMAT('EXPLAIN (FORMAT JSON) %s', query) INTO plan;
    count := CAST(plan -> 0 -> 'Plan' ->> 'Plan Rows' AS NUMERIC);
    cost := CAST(plan -> 0 -> 'Plan' ->> 'Total Cost' AS NUMERIC);
    RETURN NEXT;
  END;
$$ LANGUAGE PLPGSQL STRICT;

CREATE
OR REPLACE FUNCTION jsonb_to_text (j JSONB) RETURNS JSONB LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
  result JSONB;
BEGIN
  CASE JSONB_TYPEOF(j)
    WHEN 'object' THEN
      SELECT JSONB_OBJECT_AGG(key, jsonb_to_text(value))
      INTO result
      FROM JSONB_EACH(j);
    WHEN 'array' THEN
      SELECT JSONB_AGG(jsonb_to_text(value))
      INTO result
      FROM JSONB_ARRAY_ELEMENTS(j) AS value;
    WHEN 'number' THEN
      result := TO_JSONB(j::TEXT);
    ELSE
      result := j;
  END CASE;
  RETURN result;
END;
$$;

CREATE
OR REPLACE FUNCTION receipt_tree (p_receipt_id TEXT, p_timestamp BIGINT) RETURNS JSONB LANGUAGE SQL STABLE AS $$
  WITH
    receipt_selected AS (
      SELECT
        r.receipt_id,
        r.predecessor_account_id,
        r.receiver_account_id,
        r.public_key,
        r.included_in_block_timestamp,
        r.included_in_block_hash
      FROM
        receipts r
      WHERE
        r.included_in_block_timestamp >= p_timestamp
        AND r.included_in_block_timestamp < (p_timestamp + 300000000000) -- 5m in ns
        AND r.receipt_id = p_receipt_id
        AND r.receipt_kind = 'ACTION'
    ),
    child_receipts AS (
      SELECT
        r.receipt_id,
        r.included_in_block_timestamp
      FROM
        execution_outcome_receipts eor
        JOIN receipts r ON r.receipt_id = eor.produced_receipt_id
      WHERE
        eor.executed_receipt_id = p_receipt_id
        AND r.included_in_block_timestamp >= p_timestamp
        AND r.included_in_block_timestamp < (p_timestamp + 300000000000) -- 5m in ns
    )
  SELECT
    JSONB_BUILD_OBJECT(
      'receipt_id',
      rs.receipt_id,
      'predecessor_account_id',
      rs.predecessor_account_id,
      'receiver_account_id',
      rs.receiver_account_id,
      'public_key',
      rs.public_key,
      'block',
      COALESCE(b.block, '{}'::JSONB),
      'actions',
      COALESCE(a.actions, '[]'::JSONB),
      'outcome',
      COALESCE(o.outcome, '{}'::JSONB),
      'receipts',
      (
        SELECT
          COALESCE(
            JSONB_AGG(
              receipt_tree (cr.receipt_id, cr.included_in_block_timestamp)
            ),
            '[]'::JSONB
          )
        FROM
          child_receipts cr
      )
    )
  FROM
    receipt_selected rs
    LEFT JOIN LATERAL (
      SELECT
        JSONB_BUILD_OBJECT(
          'block_hash',
          block_hash,
          'block_height',
          block_height::TEXT,
          'block_timestamp',
          block_timestamp::TEXT
        ) AS block
      FROM
        blocks
      WHERE
        block_timestamp = (
          SELECT
            r.included_in_block_timestamp
          FROM
            receipt_selected r
        )
        AND block_hash = rs.included_in_block_hash
    ) b ON TRUE
    LEFT JOIN LATERAL (
      SELECT
        JSONB_AGG(
          JSONB_BUILD_OBJECT(
            'action',
            ara.action_kind,
            'args',
            jsonb_to_text (ara.args),
            'rlp_hash',
            ara.nep518_rlp_hash
          )
          ORDER BY
            ara.index_in_action_receipt
        ) AS actions
      FROM
        action_receipt_actions ara
      WHERE
        ara.receipt_included_in_block_timestamp = (
          SELECT
            r.included_in_block_timestamp
          FROM
            receipt_selected r
        )
        AND ara.receipt_id = rs.receipt_id
    ) a ON TRUE
    LEFT JOIN LATERAL (
      SELECT
        JSONB_BUILD_OBJECT(
          'gas_burnt',
          eo.gas_burnt::TEXT,
          'tokens_burnt',
          eo.tokens_burnt::TEXT,
          'executor_account_id',
          eo.executor_account_id,
          'status',
          (status IN ('SUCCESS_RECEIPT_ID', 'SUCCESS_VALUE')),
          'status_key',
          status,
          'logs',
          jsonb_to_text (eo.logs),
          'result',
          jsonb_to_text (eo.result)
        ) AS outcome
      FROM
        execution_outcomes eo
      WHERE
        executed_in_block_timestamp >= (
          SELECT
            r.included_in_block_timestamp
          FROM
            receipt_selected r
        )
        AND executed_in_block_timestamp < (
          SELECT
            r.included_in_block_timestamp + 300000000000 -- 5m in ns
          FROM
            receipt_selected r
        )
        AND receipt_id = rs.receipt_id
    ) o ON TRUE
$$;

CREATE INDEX b_block_height_idx ON blocks (block_height DESC);

CREATE INDEX c_block_hash_timestamp_idx ON chunks (
  included_in_block_hash,
  included_in_block_timestamp DESC
);

CREATE INDEX r_block_hash_timestamp_idx ON receipts (
  included_in_block_hash,
  included_in_block_timestamp DESC
);

CREATE INDEX t_block_hash_timestamp_idx ON transactions (included_in_block_hash, block_timestamp DESC);

CREATE INDEX ara_nep518_rlp_hash_idx ON action_receipt_actions (nep518_rlp_hash);
