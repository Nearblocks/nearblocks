import { z } from 'zod';

const item = z.object({
  key: z.string(),
});

export type Item = z.infer<typeof item>;

export default { item };
