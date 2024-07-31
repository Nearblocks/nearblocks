import { z } from 'zod';

const accounts = z.object({
  key: z.string(),
});

const deposits = z.object({
  account: z.string(),
});

const activities = z.object({
  account: z.string(),
  limit: z.number().min(0).max(100).optional().default(10),
  offset: z.number().max(5000).optional(),
});

const receivers = z.object({
  account: z.string(),
});

const tokens = z.object({
  account: z.string(),
});

const tokensFromBlock = z.object({
  account: z.string(),
  fromBlockTimestamp: z.number().optional().default(0),
});

const nfts = z.object({
  account: z.string(),
});

const nftsFromBlock = z.object({
  account: z.string(),
  fromBlockTimestamp: z.number().optional().default(0),
});

export type Accounts = z.infer<typeof accounts>;
export type Deposits = z.infer<typeof deposits>;
export type Activities = z.infer<typeof activities>;
export type Receivers = z.infer<typeof receivers>;
export type Tokens = z.infer<typeof tokens>;
export type TokensFromBlock = z.infer<typeof tokensFromBlock>;
export type Nfts = z.infer<typeof nfts>;
export type NftsFromBlock = z.infer<typeof nftsFromBlock>;

export default {
  accounts,
  activities,
  deposits,
  nfts,
  nftsFromBlock,
  receivers,
  tokens,
  tokensFromBlock,
};
