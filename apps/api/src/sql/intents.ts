import { sql } from '#sql/index';

export default {
  txn: sql('queries/intents/txn.sql'),
  txnCount: sql('queries/intents/txnCount.sql'),
  txnCountCagg: sql('queries/intents/txnCountCagg.sql'),
  txns: sql('queries/intents/txns.sql'),
};
