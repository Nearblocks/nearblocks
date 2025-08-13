SELECT
  attach_tablespace (
    'action_receipt_actions_tbs1',
    'action_receipt_actions',
    if_not_attached => true
  );

SELECT
  attach_tablespace (
    'action_receipt_actions_tbs2',
    'action_receipt_actions',
    if_not_attached => true
  );

SELECT
  attach_tablespace (
    'action_receipt_actions_tbs3',
    'action_receipt_actions',
    if_not_attached => true
  );

SELECT
  attach_tablespace (
    'receipts_tbs1',
    'receipts',
    if_not_attached => true
  );

SELECT
  attach_tablespace (
    'receipts_tbs2',
    'receipts',
    if_not_attached => true
  );

SELECT
  attach_tablespace (
    'receipts_tbs3',
    'receipts',
    if_not_attached => true
  );

SELECT
  attach_tablespace (
    'execution_outcomes_tbs1',
    'execution_outcomes',
    if_not_attached => true
  );

SELECT
  attach_tablespace (
    'execution_outcomes_tbs2',
    'execution_outcomes',
    if_not_attached => true
  );

SELECT
  attach_tablespace (
    'execution_outcomes_tbs3',
    'execution_outcomes',
    if_not_attached => true
  );

SELECT
  attach_tablespace (
    'transactions_tbs1',
    'transactions',
    if_not_attached => true
  );

ALTER TABLE execution_outcome_receipts
SET
  TABLESPACE execution_outcome_receipts_tbs1;
