import { sql } from '#sql/index';

export default {
  signatureCount: sql('queries/multichain/signatureCount.sql'),
  signatures: sql('queries/multichain/signatures.sql'),
  signatureTxn: sql('queries/multichain/signatureTxn.sql'),
};
