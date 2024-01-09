import { z } from 'zod';

const accountTxns = z.object({
  account: z.string(),
  page: z.number().positive().max(200).optional().default(1),
  per_page: z.number().positive().max(25).optional().default(25),
});

export type AccountTxns = z.infer<typeof accountTxns>;

export default { accountTxns };
