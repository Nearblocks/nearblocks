CREATE
OR REPLACE FUNCTION receipt_tree (p_receipt_id TEXT) RETURNS JSONB LANGUAGE SQL STABLE AS $$
  WITH children AS (
    SELECT
      r.receipt_id
    FROM
      execution_outcome_receipts eor
      JOIN receipts r ON r.receipt_id = eor.produced_receipt_id
    WHERE
      eor.executed_receipt_id = p_receipt_id
  )
  SELECT
    JSONB_BUILD_OBJECT(
      'receipt_id', r.receipt_id,
      'predecessor_account_id', r.predecessor_account_id,
      'receiver_account_id', r.receiver_account_id,
      'public_key', r.public_key,
      'actions', COALESCE(wrap_actions.actions, '[]'::JSONB),
      'block', JSONB_BUILD_OBJECT(
        'block_hash', b.block_hash,
        'block_height', b.block_height,
        'block_timestamp', b.block_timestamp::TEXT
      ),
      'outcome', JSONB_BUILD_OBJECT(
        'gas_burnt', eo.gas_burnt::TEXT,
        'tokens_burnt', eo.tokens_burnt::TEXT,
        'executor_account_id', eo.executor_account_id,
        'status', (status IN ('SUCCESS_RECEIPT_ID', 'SUCCESS_VALUE')),
        'logs', jsonb_to_text(eo.logs),
        'result', jsonb_to_text(eo.result)
      ),
      'receipts', (
        SELECT
          COALESCE(
            JSONB_AGG(receipt_tree (children.receipt_id)), '[]'::JSONB
          )
        FROM children
      )
    )
  FROM
    receipts r
    JOIN blocks b ON b.block_hash = r.included_in_block_hash
    JOIN execution_outcomes eo ON eo.receipt_id = r.receipt_id
    LEFT JOIN LATERAL (
      SELECT
        JSONB_AGG(
          JSONB_BUILD_OBJECT(
            'action_kind', ara.action_kind,
            'args', jsonb_to_text(ara.args),
            'rlp_hash', ara.nep518_rlp_hash
          )
        ) AS actions
      FROM
        action_receipt_actions ara
      WHERE
        ara.receipt_id = r.receipt_id
    ) wrap_actions ON TRUE
  WHERE
    r.receipt_kind = 'ACTION'
    AND r.receipt_id = p_receipt_id;
$$;
