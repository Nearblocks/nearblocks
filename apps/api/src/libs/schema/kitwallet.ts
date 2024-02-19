import { z } from 'zod';

const tokens = z.object({
  account: z.string(),
});

const tokensFromBlock = z.object({
  account: z.string(),
  fromBlockTimestamp: z.number().optional().default(0),
});

export type Tokens = z.infer<typeof tokens>;
export type TokensFromBlock = z.infer<typeof tokensFromBlock>;

export default {
  tokens,
  tokensFromBlock,
};
