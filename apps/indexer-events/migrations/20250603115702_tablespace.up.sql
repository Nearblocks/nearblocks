SELECT
  attach_tablespace ('tbs1', 'ft_events', if_not_attached => true);

SELECT
  attach_tablespace ('tbs1', 'nft_events', if_not_attached => true);

SELECT
  attach_tablespace ('tbs2', 'ft_events', if_not_attached => true);

SELECT
  attach_tablespace ('tbs2', 'nft_events', if_not_attached => true);
