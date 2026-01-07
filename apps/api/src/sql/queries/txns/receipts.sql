WITH
  ${cte:raw}
SELECT
  rt -> 'receipt_id' as receipt_id,
  rt -> 'predecessor_account_id' AS predecessor_account_id,
  rt -> 'receiver_account_id' AS receiver_account_id,
  rt -> 'public_key' AS public_key,
  rt -> 'block' AS block,
  rt -> 'actions' AS actions,
  rt -> 'outcome' AS outcome,
  rt -> 'receipts' AS receipts
FROM
  txn_selected ts,
  LATERAL receipt_tree (ts.converted_into_receipt_id, ts.block_timestamp) rt
WHERE
  rt -> 'receipt_id' IS NOT NULL
