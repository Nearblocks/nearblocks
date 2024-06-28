import { z } from 'zod';

import dayjs from '#libs/dayjs';
import { ActionKind } from '#types/enums';

const list = z.object({
  action: z.nativeEnum(ActionKind).optional(),
  after_date: z
    .string()
    .optional()
    .refine(
      (val) => val === undefined || dayjs(val, 'YYYY-MM-DD', true).isValid(),
      { message: 'Invalid date' },
    ),
  before_date: z
    .string()
    .optional()
    .refine(
      (val) => val === undefined || dayjs(val, 'YYYY-MM-DD', true).isValid(),
      { message: 'Invalid date' },
    ),
  block: z.string().optional(),
  cursor: z.number().positive().optional(),
  from: z.string().optional(),
  method: z.string().optional(),
  order: z.enum(['desc', 'asc']).optional().default('desc'),
  page: z.number().positive().max(200).optional().default(1),
  per_page: z.number().positive().max(25).optional().default(25),
  to: z.string().optional(),
});

const count = z.object({
  action: z.nativeEnum(ActionKind).optional(),
  after_date: z
    .string()
    .optional()
    .refine(
      (val) => val === undefined || dayjs(val, 'YYYY-MM-DD', true).isValid(),
      { message: 'Invalid date' },
    ),
  before_date: z
    .string()
    .optional()
    .refine(
      (val) => val === undefined || dayjs(val, 'YYYY-MM-DD', true).isValid(),
      { message: 'Invalid date' },
    ),
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
