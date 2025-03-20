import { z } from 'zod';

import { ActionKind } from '#types/enums';

const receipts = z.object({
  account: z.string(),
  action: z.nativeEnum(ActionKind).optional(),
  after_timestamp: z.string().length(19).optional(),
  before_timestamp: z.string().length(19).optional(),
  cursor: z.string().optional(),
  from: z.string().optional(),
  method: z.string().optional(),
  order: z.enum(['desc', 'asc']).optional().default('desc'),
  per_page: z.number().positive().max(100).optional().default(25),
  to: z.string().optional(),
});

const receiptsCount = z.object({
  account: z.string(),
  action: z.nativeEnum(ActionKind).optional(),
  after_date: z.string().length(19).optional(),
  before_date: z.string().length(19).optional(),
  from: z.string().optional(),
  method: z.string().optional(),
  to: z.string().optional(),
});

export type Receipts = z.infer<typeof receipts>;
export type ReceiptsCount = z.infer<typeof receiptsCount>;

export default {
  receipts,
  receiptsCount,
};
