CREATE INDEX IF NOT EXISTS t_ara_actions_args_args_json_receiver_id_idx ON public.action_receipt_actions USING btree (
  (
    (
      (args -> 'args_json'::TEXT) ->> 'receiver_id'::TEXT
    )
  )
)
WHERE
  (
    (action_kind = 'FUNCTION_CALL'::action_kind)
    AND ((args ->> 'args_json'::TEXT) IS NOT NULL)
  );
