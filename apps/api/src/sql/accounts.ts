import { sql } from '#sql/index';

export default {
  account: sql('queries/accounts/account.sql'),
  balance: sql('queries/accounts/balance.sql'),
  receipts: {
    cte: sql('queries/accounts/receipts/cte.sql'),
    cteUnion: sql('queries/accounts/receipts/cteUnion.sql'),
    estimate: sql('queries/accounts/receipts/estimate.sql'),
    receipts: sql('queries/accounts/receipts/receipts.sql'),
  },
  txns: {
    cte: sql('queries/accounts/txns/cte.sql'),
    cteUnion: sql('queries/accounts/txns/cteUnion.sql'),
    estimate: sql('queries/accounts/txns/estimate.sql'),
    txns: sql('queries/accounts/txns/txns.sql'),
  },
};
