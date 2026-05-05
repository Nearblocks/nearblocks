import { sql } from '#sql/index';

export default {
  count: sql('queries/mts/count.sql'),
  estimate: sql('queries/mts/estimate.sql'),
  txn: sql('queries/mts/txn.sql'),
  txns: sql('queries/mts/txns.sql'),
};
