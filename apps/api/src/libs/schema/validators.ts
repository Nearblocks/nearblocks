import { z } from 'zod';

const list = z.object({
  page: z.number().int().positive().max(200).optional().default(1),
  per_page: z.number().int().positive().max(250).optional().default(25),
});

export type List = z.infer<typeof list>;

export default { list };
