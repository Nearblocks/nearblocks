import { sql } from '#sql/index';

export default {
  count: sql('queries/staking/count.sql'),
  estimate: sql('queries/staking/estimate.sql'),
  txn: sql('queries/staking/txn.sql'),
  txns: sql('queries/staking/txns.sql'),
};
