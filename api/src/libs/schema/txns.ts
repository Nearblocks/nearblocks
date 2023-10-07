import { z } from 'zod';

import { ActionKind } from '#ts/enums';

const list = z.object({
  block: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  action: z.nativeEnum(ActionKind).optional(),
  method: z.string().optional(),
  page: z.number().positive().max(200).optional().default(1),
  per_page: z.number().positive().max(25).optional().default(25),
  order: z.enum(['desc', 'asc']).optional().default('desc'),
});

const count = z.object({
  block: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  action: z.nativeEnum(ActionKind).optional(),
  method: z.string().optional(),
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

export default { list, count, latest, item };
