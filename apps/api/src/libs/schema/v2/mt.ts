import { z } from 'zod';

const inventory = z.object({
  account: z.string(),
});

const meta = z.object({
  contract: z.string(),
  token_ids: z.string().transform((val) => val.split(',').filter(Boolean)),
});

export default {
  inventory,
  meta,
};

export type Inventory = z.infer<typeof inventory>;
