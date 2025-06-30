import { sql } from '#sql/index';

export default {
  count: sql('queries/txns/count.sql'),
  estimate: sql('queries/txns/estimate.sql'),
  ethCte: sql('queries/txns/ethCte.sql'),
  latestCte: sql('queries/txns/latestCte.sql'),
  receipts: sql('queries/txns/receipts.sql'),
  txn: sql('queries/txns/txn.sql'),
  txnCte: sql('queries/txns/txnCte.sql'),
  txns: sql('queries/txns/txns.sql'),
  txnsCte: sql('queries/txns/txnsCte.sql'),
};
