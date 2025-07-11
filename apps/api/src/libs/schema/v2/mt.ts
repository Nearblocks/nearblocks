import { z } from 'zod';

const inventory = z.object({
  account: z.string(),
});

const meta = z.object({
  contract: z.string(),
  token_id: z.string(),
});

export default {
  inventory,
  meta,
};

export type Inventory = z.infer<typeof inventory>;
