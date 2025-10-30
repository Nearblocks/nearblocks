import { sql } from '#sql/index';

export default {
  contract: sql('queries/nfts/contract.sql'),
  contractTxn: sql('queries/nfts/contractTxn.sql'),
  contractTxnCount: sql('queries/nfts/contractTxnCount.sql'),
  contractTxns: sql('queries/nfts/contractTxns.sql'),
  count: sql('queries/nfts/count.sql'),
  holderCount: sql('queries/nfts/holderCount.sql'),
  holders: sql('queries/nfts/holders.sql'),
  list: sql('queries/nfts/list.sql'),
  txn: sql('queries/nfts/txn.sql'),
  txnCount: sql('queries/nfts/txnCount.sql'),
  txns: sql('queries/nfts/txns.sql'),
};
