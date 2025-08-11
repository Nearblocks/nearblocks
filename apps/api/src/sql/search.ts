import { sql } from '#sql/index';

export default {
  accounts: sql('queries/search/accounts.sql'),
  blocks: sql('queries/search/blocks.sql'),
  fts: sql('queries/search/fts.sql'),
  keys: sql('queries/search/keys.sql'),
  mts: sql('queries/search/mts.sql'),
  nfts: sql('queries/search/nfts.sql'),
  receipts: sql('queries/search/receipts.sql'),
  rlp: sql('queries/search/rlp.sql'),
  txns: sql('queries/search/txns.sql'),
};
