import { sql } from '#sql/index';

export default {
  contractTxnCount: sql('queries/mts/contractTxnCount.sql'),
  contractTxns: sql('queries/mts/contractTxns.sql'),
  count: sql('queries/mts/count.sql'),
  txn: sql('queries/mts/txn.sql'),
  txns: sql('queries/mts/txns.sql'),
};
