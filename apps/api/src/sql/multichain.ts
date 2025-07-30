import { sql } from '#sql/index';

export default {
  signatures: sql('queries/multichain/signatures.sql'),
  signaturesCount: sql('queries/multichain/signaturesCount.sql'),
  signatureTxns: sql('queries/multichain/signatureTxns.sql'),
};
