import { z } from 'zod';

const accounts = z.object({
  key: z.string(),
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
export type Tokens = z.infer<typeof tokens>;
export type TokensFromBlock = z.infer<typeof tokensFromBlock>;
export type Nfts = z.infer<typeof nfts>;
export type NftsFromBlock = z.infer<typeof nftsFromBlock>;

export default {
  accounts,
  nfts,
  nftsFromBlock,
  tokens,
  tokensFromBlock,
};
