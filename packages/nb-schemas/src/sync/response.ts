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

// An RPC node behind block-proxy. While it lags, RPC falls back to the next
// endpoint; sync is false so monitors alert.
const rpcNodeStatus = v.object({
  height: v.nullable(v.string()),
  lag_secs: v.nullable(v.number()),
  sync: v.boolean(),
});

const rpcNodesStatus = v.record(v.string(), rpcNodeStatus);

const multichainStatus = v.record(v.string(), blockStatus);

const tvlStatus = v.record(v.string(), v.record(v.string(), dateStatus));

const syncStatus = v.object({
  aggregates: v.object({
    ft_holders: blockStatus,
    ft_state_holders: v.optional(blockStatus),
    intents_account_stats: v.optional(dateStatus),
    intents_stats: v.optional(dateStatus),
    // mt_holders: blockStatus,
    mt_holders: v.optional(blockStatus),
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
  rpc: v.optional(v.object({ nodes: rpcNodesStatus })),
});

const syncStatusResponse = responseSchema(syncStatus);
const blockStatusResponse = responseSchema(blockStatus);
const dateStatusResponse = responseSchema(dateStatus);
const multichainStatusResponse = responseSchema(multichainStatus);
const rpcNodesStatusResponse = responseSchema(rpcNodesStatus);
const tvlStatusResponse = responseSchema(tvlStatus);

export type BlockStatus = v.InferOutput<typeof blockStatus>;
export type DateStatus = v.InferOutput<typeof dateStatus>;
export type MultichainStatus = v.InferOutput<typeof multichainStatus>;
export type RpcNodeStatus = v.InferOutput<typeof rpcNodeStatus>;
export type RpcNodesStatus = v.InferOutput<typeof rpcNodesStatus>;
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
  rpcNodes: rpcNodesStatusResponse,
  signature: blockStatusResponse,
  staking: blockStatusResponse,
  status: syncStatusResponse,
  tvl: tvlStatusResponse,
  tvlStats: tvlStatusResponse,
};
