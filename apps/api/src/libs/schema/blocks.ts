import { z } from 'zod';

const list = z.object({
  cursor: z.string().optional(),
  page: z.number().positive().max(200).optional().default(1),
  per_page: z.number().positive().max(25).optional().default(25),
});

const latest = z.object({
  limit: z.number().positive().max(10).optional().default(10),
});

const item = z.object({
  hash: z.string(),
});

export type Item = z.infer<typeof item>;
export type List = z.infer<typeof list>;
export type Latest = z.infer<typeof latest>;

export default { item, latest, list };
