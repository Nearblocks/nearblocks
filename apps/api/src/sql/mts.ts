import { sql } from '#sql/index';

export default {
  count: sql('queries/mts/count.sql'),
  txn: sql('queries/mts/txn.sql'),
  txns: sql('queries/mts/txns.sql'),
};
