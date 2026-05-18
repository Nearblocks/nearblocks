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

const syncStatus = v.object({
  aggregates: v.object({
    ft_holders: blockStatus,
    mt_holders: blockStatus,
    nft_holders: blockStatus,
  }),
  indexers: v.object({
    accounts: blockStatus,
    balance: blockStatus,
    base: blockStatus,
    contract: blockStatus,
    events: blockStatus,
    receipts: blockStatus,
    signature: blockStatus,
    staking: blockStatus,
  }),
  jobs: v.object({
    daily_stats: dateStatus,
  }),
});

const syncStatusResponse = responseSchema(syncStatus);
const blockStatusResponse = responseSchema(blockStatus);
const dateStatusResponse = responseSchema(dateStatus);

export type BlockStatus = v.InferOutput<typeof blockStatus>;
export type DateStatus = v.InferOutput<typeof dateStatus>;
export type SyncStatus = v.InferOutput<typeof syncStatus>;
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
  mtHolders: blockStatusResponse,
  nftHolders: blockStatusResponse,
  receipts: blockStatusResponse,
  signature: blockStatusResponse,
  staking: blockStatusResponse,
  status: syncStatusResponse,
};
