import { z } from 'zod';

import dayjs from '#libs/dayjs';
import { ActionKind, EventKind } from '#ts/enums';

const item = z.object({
  account: z.string(),
});

const contract = z.object({
  account: z.string(),
});

const deployments = z.object({
  account: z.string(),
});

const action = z.object({
  account: z.string(),
  method: z.string(),
});

const inventory = z.object({
  account: z.string(),
});

const tokens = z.object({
  account: z.string(),
});

const keys = z.object({
  account: z.string(),
  page: z.number().positive().max(200).optional().default(1),
  per_page: z.number().positive().max(25).optional().default(25),
  order: z.enum(['desc', 'asc']).optional().default('desc'),
});

const keysCount = z.object({
  account: z.string(),
});

const txns = z.object({
  account: z.string(),
  from: z.string().optional(),
  to: z.string().optional(),
  action: z.nativeEnum(ActionKind).optional(),
  method: z.string().optional(),
  page: z.number().positive().max(200).optional().default(1),
  per_page: z.number().positive().max(25).optional().default(25),
  order: z.enum(['desc', 'asc']).optional().default('desc'),
});

const txnsCount = z.object({
  account: z.string(),
  from: z.string().optional(),
  to: z.string().optional(),
  action: z.nativeEnum(ActionKind).optional(),
  method: z.string().optional(),
});

const txnsExport = z.object({
  account: z.string(),
  start: z.string().refine((val) => dayjs(val, 'YYYY-MM-DD', true).isValid(), {
    message: 'Invalid date',
  }),
  end: z.string().refine((val) => dayjs(val, 'YYYY-MM-DD', true).isValid(), {
    message: 'Invalid date',
  }),
});

const ftTxns = z.object({
  account: z.string(),
  from: z.string().optional(),
  to: z.string().optional(),
  event: z.nativeEnum(EventKind).optional(),
  page: z.number().positive().max(200).optional().default(1),
  per_page: z.number().positive().max(25).optional().default(25),
  order: z.enum(['desc', 'asc']).optional().default('desc'),
});

const ftTxnsCount = z.object({
  account: z.string(),
  from: z.string().optional(),
  to: z.string().optional(),
  event: z.nativeEnum(EventKind).optional(),
});

const ftTxnsExport = z.object({
  account: z.string(),
  start: z.string().refine((val) => dayjs(val, 'YYYY-MM-DD', true).isValid(), {
    message: 'Invalid date',
  }),
  end: z.string().refine((val) => dayjs(val, 'YYYY-MM-DD', true).isValid(), {
    message: 'Invalid date',
  }),
});

const nftTxns = z.object({
  account: z.string(),
  from: z.string().optional(),
  to: z.string().optional(),
  event: z.nativeEnum(EventKind).optional(),
  page: z.number().positive().max(200).optional().default(1),
  per_page: z.number().positive().max(25).optional().default(25),
  order: z.enum(['desc', 'asc']).optional().default('desc'),
});

const nftTxnsCount = z.object({
  account: z.string(),
  from: z.string().optional(),
  to: z.string().optional(),
  event: z.nativeEnum(EventKind).optional(),
});

const nftTxnsExport = z.object({
  account: z.string(),
  start: z.string().refine((val) => dayjs(val, 'YYYY-MM-DD', true).isValid(), {
    message: 'Invalid date',
  }),
  end: z.string().refine((val) => dayjs(val, 'YYYY-MM-DD', true).isValid(), {
    message: 'Invalid date',
  }),
});

export type Item = z.infer<typeof item>;
export type Contract = z.infer<typeof contract>;
export type Deployments = z.infer<typeof deployments>;
export type Action = z.infer<typeof action>;
export type Inventory = z.infer<typeof inventory>;
export type Tokens = z.infer<typeof tokens>;
export type Keys = z.infer<typeof keys>;
export type KeysCount = z.infer<typeof keysCount>;
export type Txns = z.infer<typeof txns>;
export type TxnsCount = z.infer<typeof txnsCount>;
export type TxnsExport = z.infer<typeof txnsExport>;
export type FtTxns = z.infer<typeof ftTxns>;
export type FtTxnsCount = z.infer<typeof ftTxnsCount>;
export type FtTxnsExport = z.infer<typeof ftTxnsExport>;
export type NftTxns = z.infer<typeof nftTxns>;
export type NftTxnsCount = z.infer<typeof nftTxnsCount>;
export type NftTxnsExport = z.infer<typeof nftTxnsExport>;

export default {
  item,
  contract,
  deployments,
  action,
  inventory,
  tokens,
  keys,
  keysCount,
  txns,
  txnsCount,
  txnsExport,
  ftTxns,
  ftTxnsCount,
  ftTxnsExport,
  nftTxns,
  nftTxnsCount,
  nftTxnsExport,
};
