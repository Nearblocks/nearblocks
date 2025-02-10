import { z } from 'zod';

import { EventKind } from '#types/enums';

const list = z.object({
  order: z.enum(['desc', 'asc']).optional().default('desc'),
  page: z.number().int().positive().max(100).optional().default(1),
  per_page: z.number().int().positive().max(50).optional().default(50),
  search: z.string().optional(),
  sort: z
    .enum(['price', 'change', 'volume', 'market_cap', 'onchain_market_cap'])
    .optional()
    .default('onchain_market_cap'),
});

const count = z.object({
  search: z.string().optional(),
});

const txns = z.object({
  cursor: z.string().length(35).optional(),
  page: z.number().int().positive().max(200).optional().default(1),
  per_page: z.number().int().positive().max(250).optional().default(25),
});

const item = z.object({
  contract: z.string(),
});

const ftTxns = z.object({
  a: z.string().optional(),
  account: z.string().optional(),
  contract: z.string(),
  cursor: z.string().length(35).optional(),
  event: z.nativeEnum(EventKind).optional(),
  order: z.enum(['desc', 'asc']).optional().default('desc'),
  page: z.number().int().positive().max(200).optional().default(1),
  per_page: z.number().int().positive().max(250).optional().default(25),
});

const ftTxnsCount = z.object({
  a: z.string().optional(),
  account: z.string().optional(),
  contract: z.string(),
  event: z.nativeEnum(EventKind).optional(),
});

const holders = z.object({
  contract: z.string(),
  order: z.enum(['desc', 'asc']).optional().default('desc'),
  page: z.number().int().positive().max(200).optional().default(1),
  per_page: z.number().int().positive().max(250).optional().default(25),
});

const holdersCount = z.object({
  contract: z.string(),
});

export type List = z.infer<typeof list>;
export type Count = z.infer<typeof count>;
export type Txns = z.infer<typeof txns>;
export type Item = z.infer<typeof item>;
export type FtTxns = z.infer<typeof ftTxns>;
export type FtTxnsCount = z.infer<typeof ftTxnsCount>;
export type Holders = z.infer<typeof holders>;
export type HoldersCount = z.infer<typeof holdersCount>;

export default {
  count,
  ftTxns,
  ftTxnsCount,
  holders,
  holdersCount,
  item,
  list,
  txns,
};
