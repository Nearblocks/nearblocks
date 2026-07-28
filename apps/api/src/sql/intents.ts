import { sql } from '#sql/index';

export default {
  accountStats: sql('queries/intents/accountStats.sql'),
  blockchainStats: sql('queries/intents/blockchainStats.sql'),
  statsAssets: sql('queries/intents/statsAssets.sql'),
  statsBlockchains: sql('queries/intents/statsBlockchains.sql'),
  statsOverview: sql('queries/intents/statsOverview.sql'),
  swapStats: sql('queries/intents/swapStats.sql'),
  tokenStats: sql('queries/intents/tokenStats.sql'),
  txn: sql('queries/intents/txn.sql'),
  txnCount: sql('queries/intents/txnCount.sql'),
  txnCountCagg: sql('queries/intents/txnCountCagg.sql'),
  txns: sql('queries/intents/txns.sql'),
  volumeStats: sql('queries/intents/volumeStats.sql'),
};
