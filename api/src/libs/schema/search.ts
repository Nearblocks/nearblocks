import { z } from 'zod';

const item = z.object({
  keyword: z.any(),
});

export type Item = z.infer<typeof item>;

export default { item };
