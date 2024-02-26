import { z } from 'zod';

const list = z.object({
  page: z.number().positive().optional().default(1),
  per_page: z.number().positive().max(25).optional().default(25),
});

export type List = z.infer<typeof list>;

export default { list };
