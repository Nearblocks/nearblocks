import { z } from 'zod';

const list = z.object({
  page: z.number().positive().max(200).optional().default(1),
  per_page: z.number().positive().max(250).optional().default(25),
  rpc: z.string().url().optional(),
});

export type List = z.infer<typeof list>;

export default { list };
