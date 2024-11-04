import { z } from 'zod';

import dayjs from '#libs/dayjs';

const multiChainAccounts = z.object({
  account: z.string(),
});

const multiChainTxns = z.object({
  account: z.string(),
  after_block: z.number().optional(),
  after_date: z
    .string()
    .optional()
    .refine(
      (val) => val === undefined || dayjs(val, 'YYYY-MM-DD', true).isValid(),
      { message: 'Invalid date' },
    ),
  before_block: z.number().optional(),
  before_date: z
    .string()
    .optional()
    .refine(
      (val) => val === undefined || dayjs(val, 'YYYY-MM-DD', true).isValid(),
      { message: 'Invalid date' },
    ),
  chain: z.string().optional(),
  cursor: z.string().optional(),
  from: z.string().optional(),
  multichain_address: z.string().optional(),
  order: z.enum(['desc', 'asc']).optional().default('desc'),
  page: z.number().positive().max(200).optional().default(1),
  per_page: z.number().positive().max(250).optional().default(25),
});

const multiChainTxnsCount = z.object({
  account: z.string(),
  after_block: z.number().optional(),
  after_date: z
    .string()
    .optional()
    .refine(
      (val) => val === undefined || dayjs(val, 'YYYY-MM-DD', true).isValid(),
      { message: 'Invalid date' },
    ),
  before_block: z.number().optional(),
  before_date: z
    .string()
    .optional()
    .refine(
      (val) => val === undefined || dayjs(val, 'YYYY-MM-DD', true).isValid(),
      { message: 'Invalid date' },
    ),
  chain: z.string().optional(),
  from: z.string().optional(),
  multichain_address: z.string().optional(),
});

export type MultiChainAccounts = z.infer<typeof multiChainAccounts>;
export type MultiChainTxns = z.infer<typeof multiChainTxns>;
export type MultiChainTxnsCount = z.infer<typeof multiChainTxnsCount>;

export default {
  multiChainAccounts,
  multiChainTxns,
  multiChainTxnsCount,
};
