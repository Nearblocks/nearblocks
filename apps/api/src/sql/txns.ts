import { sql } from '#sql/index';

export default {
  count: sql('queries/txns/count.sql'),
  estimate: sql('queries/txns/estimate.sql'),
  events: sql('queries/txns/events.sql'),
  eventsRlp: sql('queries/txns/eventsRlp.sql'),
  ft: sql('queries/txns/ft.sql'),
  latestCte: sql('queries/txns/latestCte.sql'),
  nft: sql('queries/txns/nft.sql'),
  receipts: sql('queries/txns/receipts.sql'),
  rlpCte: sql('queries/txns/rlpCte.sql'),
  txn: sql('queries/txns/txn.sql'),
  txnCte: sql('queries/txns/txnCte.sql'),
  txns: sql('queries/txns/txns.sql'),
  txnsCte: sql('queries/txns/txnsCte.sql'),
};
