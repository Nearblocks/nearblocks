import { sql } from '#sql/index';

export default {
  contractTxn: sql('queries/nfts/contractTxn.sql'),
  contractTxnCount: sql('queries/nfts/contractTxnCount.sql'),
  contractTxns: sql('queries/nfts/contractTxns.sql'),
  txn: sql('queries/nfts/txn.sql'),
  txnCount: sql('queries/nfts/txnCount.sql'),
  txns: sql('queries/nfts/txns.sql'),
};
