import { z } from 'zod';

const txn = z.object({
  hash: z.string(),
});

const txnReceipts = z.object({
  hash: z.string(),
});

export type Txn = z.infer<typeof txn>;
export type TxnReceipts = z.infer<typeof txnReceipts>;

export default { txn, txnReceipts };
