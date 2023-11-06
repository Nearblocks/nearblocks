import { z } from 'zod';

import { EventKind } from '#ts/enums';

const list = z.object({
  search: z.string().optional(),
  page: z.number().positive().max(200).optional().default(1),
  per_page: z.number().positive().max(50).optional().default(50),
  sort: z
    .enum([
      'name',
      'price',
      'change',
      'market_cap',
      'onchain_market_cap',
      'volume',
      'holders',
    ])
    .optional()
    .default('onchain_market_cap'),
  order: z.enum(['desc', 'asc']).optional().default('desc'),
});

const count = z.object({
  search: z.string().optional(),
});

const txns = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  event: z.nativeEnum(EventKind).optional(),
  page: z.number().positive().max(200).optional().default(1),
  per_page: z.number().positive().max(25).optional().default(25),
  order: z.enum(['desc', 'asc']).optional().default('desc'),
});

const txnsCount = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  event: z.nativeEnum(EventKind).optional(),
});

const item = z.object({
  contract: z.string(),
});

const ftTxns = z.object({
  contract: z.string(),
  a: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  event: z.nativeEnum(EventKind).optional(),
  page: z.number().positive().max(200).optional().default(1),
  per_page: z.number().positive().max(25).optional().default(25),
  order: z.enum(['desc', 'asc']).optional().default('desc'),
});

const ftTxnsCount = z.object({
  contract: z.string(),
  a: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  event: z.nativeEnum(EventKind).optional(),
});

const holders = z.object({
  contract: z.string(),
  page: z.number().positive().max(200).optional().default(1),
  per_page: z.number().positive().max(25).optional().default(25),
  order: z.enum(['desc', 'asc']).optional().default('desc'),
});

const holdersCount = z.object({
  contract: z.string(),
});

export type List = z.infer<typeof list>;
export type Count = z.infer<typeof count>;
export type Txns = z.infer<typeof txns>;
export type TxnsCount = z.infer<typeof txnsCount>;
export type Item = z.infer<typeof item>;
export type FtTxns = z.infer<typeof ftTxns>;
export type FtTxnsCount = z.infer<typeof ftTxnsCount>;
export type Holders = z.infer<typeof holders>;
export type HoldersCount = z.infer<typeof holdersCount>;

export default {
  list,
  count,
  txns,
  txnsCount,
  item,
  ftTxns,
  ftTxnsCount,
  holders,
  holdersCount,
};
