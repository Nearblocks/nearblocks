import { sql } from '#sql/index';

export default {
  signatureCount: sql('queries/multichain/signatureCount.sql'),
  signatureCountEstimate: sql('queries/multichain/signatureCountEstimate.sql'),
  signatures: sql('queries/multichain/signatures.sql'),
  signatureTxn: sql('queries/multichain/signatureTxn.sql'),
  stats: sql('queries/multichain/stats.sql'),
  validators: sql('queries/multichain/validators.sql'),
};
