import { sql } from '#sql/index';

export default {
  contract: sql('queries/fts/contract.sql'),
  contractTxn: sql('queries/fts/contractTxn.sql'),
  contractTxnCount: sql('queries/fts/contractTxnCount.sql'),
  contractTxnCountCagg: sql('queries/fts/contractTxnCountCagg.sql'),
  contractTxns: sql('queries/fts/contractTxns.sql'),
  count: sql('queries/fts/count.sql'),
  holderCount: sql('queries/fts/holderCount.sql'),
  holders: sql('queries/fts/holders.sql'),
  list: sql('queries/fts/list.sql'),
  stats: {
    accounts: sql('queries/fts/statsAccounts.sql'),
    heatmap: sql('queries/fts/statsHeatmap.sql'),
    overview: sql('queries/fts/statsOverview.sql'),
    transfers: sql('queries/fts/statsTransfers.sql'),
  },
  txn: sql('queries/fts/txn.sql'),
  txnCount: sql('queries/fts/txnCount.sql'),
  txnCountCagg: sql('queries/fts/txnCountCagg.sql'),
  txns: sql('queries/fts/txns.sql'),
};
