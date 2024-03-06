DROP TRIGGER balance_events_insert_trigger ON balance_events;

DROP TRIGGER balance_events_update_trigger ON balance_events;

DROP TRIGGER balance_events_delete_trigger ON balance_events;

DROP TRIGGER ft_events_insert_trigger ON ft_events;

DROP TRIGGER ft_events_update_trigger ON ft_events;

DROP TRIGGER ft_events_delete_trigger ON ft_events;

DROP TRIGGER nft_events_insert_trigger ON nft_events;

DROP TRIGGER nft_events_update_trigger ON nft_events;

DROP TRIGGER nft_events_delete_trigger ON nft_events;

CREATE TRIGGER balance_events_insert_trigger
AFTER INSERT ON temp_balance_events FOR EACH ROW
EXECUTE FUNCTION sync_balance_events_insert ();

CREATE TRIGGER balance_events_update_trigger
AFTER
UPDATE ON temp_balance_events FOR EACH ROW
EXECUTE FUNCTION sync_balance_events_update ();

CREATE TRIGGER balance_events_delete_trigger
AFTER DELETE ON temp_balance_events FOR EACH ROW
EXECUTE FUNCTION sync_balance_events_delete ();

CREATE TRIGGER ft_events_insert_trigger
AFTER INSERT ON temp_ft_events FOR EACH ROW
EXECUTE FUNCTION sync_ft_events_insert ();

CREATE TRIGGER ft_events_update_trigger
AFTER
UPDATE ON temp_ft_events FOR EACH ROW
EXECUTE FUNCTION sync_ft_events_update ();

CREATE TRIGGER ft_events_delete_trigger
AFTER DELETE ON temp_ft_events FOR EACH ROW
EXECUTE FUNCTION sync_ft_events_delete ();

CREATE TRIGGER nft_events_insert_trigger
AFTER INSERT ON temp_nft_events FOR EACH ROW
EXECUTE FUNCTION sync_nft_events_insert ();

CREATE TRIGGER nft_events_update_trigger
AFTER
UPDATE ON temp_nft_events FOR EACH ROW
EXECUTE FUNCTION sync_nft_events_update ();

CREATE TRIGGER nft_events_delete_trigger
AFTER DELETE ON temp_nft_events FOR EACH ROW
EXECUTE FUNCTION sync_nft_events_delete ();
