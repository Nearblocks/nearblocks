import { z } from 'zod';

import { EventKind } from '#types/enums';

const list = z.object({
  order: z.enum(['desc', 'asc']).optional().default('desc'),
  page: z.number().int().positive().max(100).optional().default(1),
  per_page: z.number().int().positive().max(50).optional().default(50),
  search: z.string().optional(),
  sort: z
    .enum(['holders', 'tokens', 'txns_day'])
    .optional()
    .default('txns_day'),
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

const nftTxns = z.object({
  a: z.string().optional(),
  account: z.string().optional(),
  contract: z.string(),
  cursor: z.string().length(35).optional(),
  event: z.nativeEnum(EventKind).optional(),
  order: z.enum(['desc', 'asc']).optional().default('desc'),
  page: z.number().int().positive().max(200).optional().default(1),
  per_page: z.number().int().positive().max(250).optional().default(25),
});

const nftTxnsCount = z.object({
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

const tokens = z.object({
  contract: z.string(),
  page: z.number().int().positive().max(200).optional().default(1),
  per_page: z.number().int().positive().max(250).optional().default(25),
});

const tokensCount = z.object({
  contract: z.string(),
});

const tokenItem = z.object({
  contract: z.string(),
  token: z.string(),
});

const tokenTxns = z.object({
  contract: z.string(),
  cursor: z.string().length(35).optional(),
  event: z.nativeEnum(EventKind).optional(),
  order: z.enum(['desc', 'asc']).optional().default('desc'),
  page: z.number().int().positive().max(200).optional().default(1),
  per_page: z.number().int().positive().max(250).optional().default(25),
  token: z.string(),
});

const tokenTxnsCount = z.object({
  contract: z.string(),
  event: z.nativeEnum(EventKind).optional(),
  token: z.string(),
});

export type List = z.infer<typeof list>;
export type Count = z.infer<typeof count>;
export type Txns = z.infer<typeof txns>;
export type Item = z.infer<typeof item>;
export type NftTxns = z.infer<typeof nftTxns>;
export type NftTxnsCount = z.infer<typeof nftTxnsCount>;
export type Holders = z.infer<typeof holders>;
export type HoldersCount = z.infer<typeof holdersCount>;
export type Tokens = z.infer<typeof tokens>;
export type TokensCount = z.infer<typeof tokensCount>;
export type TokenItem = z.infer<typeof tokenItem>;
export type TokenTxns = z.infer<typeof tokenTxns>;
export type TokenTxnsCount = z.infer<typeof tokenTxnsCount>;

export default {
  count,
  holders,
  holdersCount,
  item,
  list,
  nftTxns,
  nftTxnsCount,
  tokenItem,
  tokens,
  tokensCount,
  tokenTxns,
  tokenTxnsCount,
  txns,
};
