import { z } from 'zod';

const inventory = z.object({
  account: z.string(),
});

export const schema = {
  inventory: inventory,

  meta: z.object({
    contract: z.string(),
    token_ids: z.string().transform((val) => val.split(',').filter(Boolean)),
  }),
};

export type Inventory = z.infer<typeof inventory>;
