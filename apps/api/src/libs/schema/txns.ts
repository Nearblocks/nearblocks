import { z } from 'zod';

import { ActionKind } from '#types/enums';

const list = z.object({
  action: z.nativeEnum(ActionKind).optional(),
  block: z.string().optional(),
  from: z.string().optional(),
  method: z.string().optional(),
  order: z.enum(['desc', 'asc']).optional().default('desc'),
  page: z.number().positive().optional().default(1),
  per_page: z.number().positive().max(25).optional().default(25),
  to: z.string().optional(),
});

const count = z.object({
  action: z.nativeEnum(ActionKind).optional(),
  block: z.string().optional(),
  from: z.string().optional(),
  method: z.string().optional(),
  to: z.string().optional(),
});

const latest = z.object({
  limit: z.number().positive().max(10).optional().default(10),
});

const item = z.object({
  hash: z.string(),
});

export type List = z.infer<typeof list>;
export type Count = z.infer<typeof count>;
export type Latest = z.infer<typeof latest>;
export type Item = z.infer<typeof item>;

export default { count, item, latest, list };
