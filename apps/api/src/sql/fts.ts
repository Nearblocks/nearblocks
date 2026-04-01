import { sql } from '#sql/index';

export default {
  contract: sql('queries/fts/contract.sql'),
  contractTxn: sql('queries/fts/contractTxn.sql'),
  contractTxnCount: sql('queries/fts/contractTxnCount.sql'),
  contractTxnEstimate: sql('queries/fts/contractTxnEstimate.sql'),
  contractTxns: sql('queries/fts/contractTxns.sql'),
  count: sql('queries/fts/count.sql'),
  holderCount: sql('queries/fts/holderCount.sql'),
  holders: sql('queries/fts/holders.sql'),
  list: sql('queries/fts/list.sql'),
  txn: sql('queries/fts/txn.sql'),
  txnCount: sql('queries/fts/txnCount.sql'),
  txnEstimate: sql('queries/fts/txnEstimate.sql'),
  txns: sql('queries/fts/txns.sql'),
};
