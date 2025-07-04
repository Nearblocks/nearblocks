import { z } from 'zod';

export const schema = {
  list: z.object({
    account: z.string(),
  }),

  meta: z.object({
    contract: z.string(),
    token_ids: z.array(z.string()),
  }),
};
