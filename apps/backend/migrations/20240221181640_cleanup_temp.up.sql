DROP TABLE access_keys;

DROP TABLE accounts;

DROP TABLE action_receipt_actions;

DROP TABLE action_receipt_output_data;

DROP TABLE blocks;

DROP TABLE chunks;

DROP TABLE execution_outcomes;

DROP TABLE execution_outcome_receipts;

DROP TABLE receipts;

DROP TABLE transactions;

DROP TABLE balance_events;

DROP TABLE ft_events;

DROP TABLE nft_events;

ALTER TABLE temp_access_keys
RENAME TO access_keys;

ALTER TABLE temp_accounts
RENAME TO accounts;

ALTER TABLE temp_action_receipt_actions
RENAME TO action_receipt_actions;

ALTER TABLE temp_action_receipt_output_data
RENAME TO action_receipt_output_data;

ALTER TABLE temp_blocks
RENAME TO blocks;

ALTER TABLE temp_chunks
RENAME TO chunks;

ALTER TABLE temp_execution_outcomes
RENAME TO execution_outcomes;

ALTER TABLE temp_execution_outcome_receipts
RENAME TO execution_outcome_receipts;

ALTER TABLE temp_receipts
RENAME TO receipts;

ALTER TABLE temp_transactions
RENAME TO transactions;

ALTER TABLE temp_balance_events
RENAME TO balance_events;

ALTER TABLE temp_ft_events
RENAME TO ft_events;

ALTER TABLE temp_nft_events
RENAME TO nft_events;

CREATE TRIGGER balance_events_insert_trigger
AFTER INSERT ON balance_events FOR EACH ROW
EXECUTE FUNCTION sync_balance_events_insert ();

CREATE TRIGGER ft_events_insert_trigger
AFTER INSERT ON ft_events FOR EACH ROW
EXECUTE FUNCTION sync_ft_events_insert ();

CREATE TRIGGER nft_events_insert_trigger
AFTER INSERT ON nft_events FOR EACH ROW
EXECUTE FUNCTION sync_nft_events_insert ();

CREATE TRIGGER balance_events_update_trigger
AFTER
UPDATE ON balance_events FOR EACH ROW
EXECUTE FUNCTION sync_balance_events_update ();

CREATE TRIGGER ft_events_update_trigger
AFTER
UPDATE ON ft_events FOR EACH ROW
EXECUTE FUNCTION sync_ft_events_update ();

CREATE TRIGGER nft_events_update_trigger
AFTER
UPDATE ON nft_events FOR EACH ROW
EXECUTE FUNCTION sync_nft_events_update ();

CREATE TRIGGER balance_events_delete_trigger
AFTER DELETE ON balance_events FOR EACH ROW
EXECUTE FUNCTION sync_balance_events_delete ();

CREATE TRIGGER ft_events_delete_trigger
AFTER DELETE ON ft_events FOR EACH ROW
EXECUTE FUNCTION sync_ft_events_delete ();

CREATE TRIGGER nft_events_delete_trigger
AFTER DELETE ON nft_events FOR EACH ROW
EXECUTE FUNCTION sync_nft_events_delete ();
