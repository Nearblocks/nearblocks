CREATE INDEX IF NOT EXISTS ara_args_deposit_idx ON action_receipt_actions USING btree ((args ->> 'method_name'::TEXT))
WHERE
  (
    action_kind IN (
      'FUNCTION_CALL'::action_kind,
      'TRANSFER'::action_kind
    )
  );

CREATE INDEX IF NOT EXISTS a_created_by_block_height_idx ON accounts USING btree (created_by_block_height DESC);

CREATE INDEX IF NOT EXISTS a_deleted_by_block_height_idx ON accounts USING btree (deleted_by_block_height DESC);
