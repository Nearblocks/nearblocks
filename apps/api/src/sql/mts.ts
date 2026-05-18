import { sql } from '#sql/index';

export default {
  contractTxnCount: sql('queries/mts/contractTxnCount.sql'),
  contractTxns: sql('queries/mts/contractTxns.sql'),
  count: sql('queries/mts/count.sql'),
  holderCount: sql('queries/mts/holderCount.sql'),
  holders: sql('queries/mts/holders.sql'),
  txn: sql('queries/mts/txn.sql'),
  txns: sql('queries/mts/txns.sql'),
};
