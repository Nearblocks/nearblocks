import { sql } from '#sql/index';

export default {
  contractTxnCount: sql('queries/mts/contractTxnCount.sql'),
  contractTxns: sql('queries/mts/contractTxns.sql'),
  count: sql('queries/mts/count.sql'),
  holderCount: sql('queries/mts/holderCount.sql'),
  holders: sql('queries/mts/holders.sql'),
  tokens: {
    token: sql('queries/mts/tokens/token.sql'),
    tokenCount: sql('queries/mts/tokens/tokenCount.sql'),
    tokenHolderCount: sql('queries/mts/tokens/tokenHolderCount.sql'),
    tokenHolders: sql('queries/mts/tokens/tokenHolders.sql'),
    tokens: sql('queries/mts/tokens/tokens.sql'),
    tokensByPrice: sql('queries/mts/tokens/tokensByPrice.sql'),
    tokenTxn: sql('queries/mts/tokens/tokenTxn.sql'),
    tokenTxnCount: sql('queries/mts/tokens/tokenTxnCount.sql'),
    tokenTxns: sql('queries/mts/tokens/tokenTxns.sql'),
  },
  txn: sql('queries/mts/txn.sql'),
  txns: sql('queries/mts/txns.sql'),
};
