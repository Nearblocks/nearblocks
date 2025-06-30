SELECT
  count,
  cost
FROM
  count_cost_estimate (
    FORMAT(
      'SELECT
        predecessor_account_id
      FROM
        receipts
      WHERE
        predecessor_account_id = %L',
      $1
    )
  );
