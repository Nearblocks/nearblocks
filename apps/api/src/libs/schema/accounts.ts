import { z } from 'zod';

const ethList = z.object({
  page: z.number().int().positive().max(100).optional().default(1),
  per_page: z.number().int().positive().max(50).optional().default(50),
});

export type EthList = z.infer<typeof ethList>;

export default {
  ethList,
};
