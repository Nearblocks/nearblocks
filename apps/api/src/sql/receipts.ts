import { sql } from '#sql/index';

export default {
  blockTs: sql('queries/receipts/blockTs.sql'),
  count: sql('queries/receipts/count.sql'),
  cte: sql('queries/receipts/cte.sql'),
  estimate: sql('queries/receipts/estimate.sql'),
  receipts: sql('queries/receipts/receipts.sql'),
};
