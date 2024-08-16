import { z } from 'zod';

const list = z.object({
  order: z.enum(['desc', 'asc']).optional().default('desc'),
  page: z.number().positive().max(100).optional().default(1),
  per_page: z.number().positive().max(50).optional().default(50),
  search: z.string().optional(),
  sort: z.enum(['volume', 'txns', 'makers']).optional().default('volume'),
});

const count = z.object({
  search: z.string().optional(),
});

const item = z.object({
  pair: z.string(),
});

const txns = z.object({
  a: z.string().optional(),
  cursor: z.string().optional(),
  pair: z.string(),
  per_page: z.number().positive().max(25).optional().default(25),
});

const txnsCount = z.object({
  a: z.string().optional(),
  pair: z.string(),
});

const charts = z.object({
  interval: z.enum(['1m', '1h', '1d']).optional().default('1m'),
  limit: z.number().positive().optional().default(25),
  pair: z.string(),
  to: z.number().positive(),
});

export type List = z.infer<typeof list>;
export type Count = z.infer<typeof count>;
export type Item = z.infer<typeof item>;
export type Txns = z.infer<typeof txns>;
export type TxnsCount = z.infer<typeof txnsCount>;
export type Charts = z.infer<typeof charts>;

export default {
  charts,
  count,
  item,
  list,
  txns,
  txnsCount,
};
