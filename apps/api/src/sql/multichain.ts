import { sql } from '#sql/index';

export default {
  signatureCount: sql('queries/multichain/signatureCount.sql'),
  signatureEstimate: sql('queries/multichain/signatureEstimate.sql'),
  signatures: sql('queries/multichain/signatures.sql'),
  signatureTxn: sql('queries/multichain/signatureTxn.sql'),
  stats: sql('queries/multichain/stats.sql'),
};
