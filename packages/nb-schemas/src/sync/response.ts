import * as v from 'valibot';

import { responseSchema } from '../common.js';

const blockStatus = v.object({
  height: v.nullable(v.string()),
  sync: v.boolean(),
  timestamp: v.nullable(v.string()),
});

const dateStatus = v.object({
  date: v.nullable(v.string()),
  sync: v.boolean(),
});

const multichainStatus = v.record(v.string(), blockStatus);

const tvlStatus = v.record(v.string(), v.record(v.string(), dateStatus));

const syncStatus = v.object({
  aggregates: v.object({
    ft_holders: blockStatus,
    ft_state_holders: v.optional(blockStatus),
    intents_account_stats: v.optional(dateStatus),
    intents_stats: v.optional(dateStatus),
    mt_holders: blockStatus,
    nft_account_holders: v.optional(blockStatus),
    nft_holders: blockStatus,
    tvl: tvlStatus,
  }),
  indexers: v.object({
    accounts: blockStatus,
    balance: blockStatus,
    base: blockStatus,
    contract: blockStatus,
    events: blockStatus,
    ft_state: v.optional(blockStatus),
    intents: v.optional(blockStatus),
    multichain: multichainStatus,
    receipts: blockStatus,
    signature: blockStatus,
    staking: blockStatus,
    tvl: tvlStatus,
  }),
  jobs: v.object({
    daily_stats: dateStatus,
  }),
});

const syncStatusResponse = responseSchema(syncStatus);
const blockStatusResponse = responseSchema(blockStatus);
const dateStatusResponse = responseSchema(dateStatus);
const multichainStatusResponse = responseSchema(multichainStatus);
const tvlStatusResponse = responseSchema(tvlStatus);

export type BlockStatus = v.InferOutput<typeof blockStatus>;
export type DateStatus = v.InferOutput<typeof dateStatus>;
export type MultichainStatus = v.InferOutput<typeof multichainStatus>;
export type SyncStatus = v.InferOutput<typeof syncStatus>;
export type TvlStatus = v.InferOutput<typeof tvlStatus>;
export type SyncStatusRes = v.InferOutput<typeof syncStatusResponse>;
export type BlockStatusRes = v.InferOutput<typeof blockStatusResponse>;
export type DateStatusRes = v.InferOutput<typeof dateStatusResponse>;

export default {
  accounts: blockStatusResponse,
  balance: blockStatusResponse,
  base: blockStatusResponse,
  contract: blockStatusResponse,
  dailyStats: dateStatusResponse,
  events: blockStatusResponse,
  ftHolders: blockStatusResponse,
  ftState: blockStatusResponse,
  ftStateHolders: blockStatusResponse,
  intents: blockStatusResponse,
  intentsAccountStats: dateStatusResponse,
  intentsStats: dateStatusResponse,
  mtHolders: blockStatusResponse,
  multichain: multichainStatusResponse,
  nftAccountHolders: blockStatusResponse,
  nftHolders: blockStatusResponse,
  receipts: blockStatusResponse,
  signature: blockStatusResponse,
  staking: blockStatusResponse,
  status: syncStatusResponse,
  tvl: tvlStatusResponse,
  tvlStats: tvlStatusResponse,
};
