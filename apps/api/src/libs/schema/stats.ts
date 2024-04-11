import { z } from 'zod';

const price = z.object({
  date: z.string().optional(),
});

export type Price = z.infer<typeof price>;

export default { price };
