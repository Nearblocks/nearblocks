SELECT
  attach_tablespace (
    'action-receipt-actions-tbs1',
    'action_receipt_actions',
    if_not_attached => true
  );

SELECT
  attach_tablespace (
    'action-receipt-actions-tbs2',
    'action_receipt_actions',
    if_not_attached => true
  );

SELECT
  attach_tablespace (
    'receipts-tbs1',
    'receipts',
    if_not_attached => true
  );

SELECT
  attach_tablespace (
    'receipts-tbs2',
    'receipts',
    if_not_attached => true
  );

SELECT
  attach_tablespace (
    'execution-outcomes-tbs1',
    'execution_outcomes',
    if_not_attached => true
  );

SELECT
  attach_tablespace (
    'execution-outcomes-tbs2',
    'execution_outcomes',
    if_not_attached => true
  );

SELECT
  attach_tablespace (
    'transactions-tbs1',
    'transactions',
    if_not_attached => true
  );

ALTER TABLE execution_outcome_receipts
SET
  TABLESPACE execution - outcome - receipts - tbs1;
