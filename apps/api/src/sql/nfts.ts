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
  tokens: {
    token: sql('queries/nfts/tokens/token.sql'),
    tokenCount: sql('queries/nfts/tokens/tokenCount.sql'),
    tokens: sql('queries/nfts/tokens/tokens.sql'),
    tokenTxn: sql('queries/nfts/tokens/tokenTxn.sql'),
    tokenTxnCount: sql('queries/nfts/tokens/tokenTxnCount.sql'),
    tokenTxns: sql('queries/nfts/tokens/tokenTxns.sql'),
  },
  txn: sql('queries/nfts/txn.sql'),
  txnCount: sql('queries/nfts/txnCount.sql'),
  txns: sql('queries/nfts/txns.sql'),
};
