import * as v from 'valibot';

const accounts = v.object({
  key: v.string(),
});

const deposits = v.object({
  account: v.string(),
});

const tokens = v.object({
  account: v.string(),
});

const tokensFromBlock = v.object({
  account: v.string(),
  fromBlockTimestamp: v.optional(
    v.pipe(
      v.union([v.number(), v.string()]),
      v.transform(String),
      v.regex(/^\d+$/, 'Invalid type: Expected numeric string'),
    ),
    '0',
  ),
});

export type KitwalletAccountsReq = v.InferOutput<typeof accounts>;
export type KitwalletDepositsReq = v.InferOutput<typeof deposits>;
export type KitwalletTokensReq = v.InferOutput<typeof tokens>;
export type KitwalletTokensFromBlockReq = v.InferOutput<typeof tokensFromBlock>;

export default {
  accounts,
  deposits,
  tokens,
  tokensFromBlock,
};
