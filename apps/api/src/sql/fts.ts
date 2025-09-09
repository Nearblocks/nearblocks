import { sql } from '#sql/index';

export default {
  contractTxn: sql('queries/fts/contractTxn.sql'),
  contractTxnCount: sql('queries/fts/contractTxnCount.sql'),
  contractTxns: sql('queries/fts/contractTxns.sql'),
  txn: sql('queries/fts/txn.sql'),
  txnCount: sql('queries/fts/txnCount.sql'),
  txns: sql('queries/fts/txns.sql'),
};
