import { sql } from '#sql/index';

export default {
  blockTs: sql('queries/receipts/blockTs.sql'),
  count: sql('queries/receipts/count.sql'),
  countCagg: sql('queries/receipts/countCagg.sql'),
  cte: sql('queries/receipts/cte.sql'),
  receipts: sql('queries/receipts/receipts.sql'),
};
