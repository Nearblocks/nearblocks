import { sql } from '#sql/index';

export default {
  address: sql('queries/stats/address.sql'),
  block: sql('queries/stats/block.sql'),
  contract: sql('queries/stats/contract.sql'),
  fees: sql('queries/stats/fees.sql'),
  price: sql('queries/stats/price.sql'),
  signer: sql('queries/stats/signer.sql'),
  signerTotal: sql('queries/stats/signerTotal.sql'),
  stats: sql('queries/stats/stats.sql'),
  tps: sql('queries/stats/tps.sql'),
  txn: sql('queries/stats/txn.sql'),
};
