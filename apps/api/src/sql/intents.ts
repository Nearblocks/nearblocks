import { sql } from '#sql/index';

export default {
  statsAssets: sql('queries/intents/statsAssets.sql'),
  statsBlockchains: sql('queries/intents/statsBlockchains.sql'),
  statsOverview: sql('queries/intents/statsOverview.sql'),
  swapStats: sql('queries/intents/swapStats.sql'),
  txn: sql('queries/intents/txn.sql'),
  txnCount: sql('queries/intents/txnCount.sql'),
  txnCountCagg: sql('queries/intents/txnCountCagg.sql'),
  txns: sql('queries/intents/txns.sql'),
  volumeStats: sql('queries/intents/volumeStats.sql'),
};
