BEGIN;

LOCK TABLE public.accounts,
public.access_keys IN ACCESS EXCLUSIVE MODE;

CREATE SCHEMA IF NOT EXISTS legacy;

ALTER TABLE public.accounts
SET SCHEMA legacy;

ALTER TABLE public.access_keys
SET SCHEMA legacy;

ALTER TABLE rebuild.accounts
SET SCHEMA public;

ALTER TABLE rebuild.access_keys
SET SCHEMA public;

DROP TRIGGER account_parent_trigger ON public.accounts;

CREATE TRIGGER account_parent_trigger
AFTER INSERT ON public.accounts REFERENCING NEW TABLE AS new_table FOR EACH STATEMENT
EXECUTE FUNCTION public.update_account_parent ();

UPDATE public.settings s
SET
  value = JSONB_BUILD_OBJECT('sync', r.value -> 'sync')
FROM
  rebuild.settings r
WHERE
  s.key = 'accounts'
  AND r.key = 'accounts';

COMMIT;
