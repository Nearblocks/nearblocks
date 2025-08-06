import { sql } from '#sql/index';

export default {
  signatureCount: sql('queries/multichain/signatureCount.sql'),
  signatures: sql('queries/multichain/signatures.sql'),
  signatureTxns: sql('queries/multichain/signatureTxns.sql'),
};
