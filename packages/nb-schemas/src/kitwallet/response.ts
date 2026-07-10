import * as v from 'valibot';

const accounts = v.array(v.string());

const pools = v.array(v.string());

const deposit = v.object({
  deposit: v.string(),
  validator_id: v.string(),
});

const deposits = v.array(deposit);

const likely = v.array(v.string());

const likelyFromBlock = v.object({
  lastBlockTimestamp: v.string(),
  list: v.array(v.string()),
  version: v.string(),
});

const tokens = likely;
const tokensFromBlock = likelyFromBlock;
const nfts = likely;
const nftsFromBlock = likelyFromBlock;

export type KitwalletPools = v.InferOutput<typeof pools>;
export type KitwalletDeposit = v.InferOutput<typeof deposit>;

export default {
  accounts,
  deposits,
  nfts,
  nftsFromBlock,
  pools,
  tokens,
  tokensFromBlock,
};
