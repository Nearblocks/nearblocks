import { z } from 'zod';

const txns = z.object({
  hash: z.string(),
});

const txnReceipts = z.object({
  hash: z.string(),
});

export type Txn = z.infer<typeof txns>;
export type TxnReceipts = z.infer<typeof txnReceipts>;

export default { txns, txnReceipts };
