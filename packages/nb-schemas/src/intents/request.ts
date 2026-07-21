import * as v from 'valibot';

import { cursorSchema, limit, limitSchema, tsSchema } from '../common.js';

const txns = v.object({
  before_ts: tsSchema,
  limit: limitSchema,
  next: cursorSchema,
  prev: cursorSchema,
});

const count = v.object({
  before_ts: tsSchema,
});

const cursor = v.object({
  index: v.number(),
  shard: v.number(),
  timestamp: v.string(),
});

const volumeStats = v.object({
  date: v.optional(v.pipe(v.string(), v.isoDate())),
  limit: v.optional(limit(365)),
});

const swapStats = v.object({
  date: v.optional(v.pipe(v.string(), v.isoDate())),
  limit: v.optional(limit(365)),
});

const statsAssets = v.object({
  date: v.optional(v.pipe(v.string(), v.isoDate())),
  limit: v.optional(limit(365)),
});

const statsBlockchains = v.object({
  date: v.optional(v.pipe(v.string(), v.isoDate())),
  limit: v.optional(limit(365)),
});

export type IntentsTxnsReq = v.InferOutput<typeof txns>;
export type IntentsTxnCountReq = v.InferOutput<typeof count>;
export type IntentsTxnsCursor = v.InferOutput<typeof cursor>;
export type IntentsVolumeStatsReq = v.InferOutput<typeof volumeStats>;
export type IntentsSwapStatsReq = v.InferOutput<typeof swapStats>;
export type IntentsStatsAssetsReq = v.InferOutput<typeof statsAssets>;
export type IntentsStatsBlockchainsReq = v.InferOutput<typeof statsBlockchains>;

export default {
  count,
  cursor,
  statsAssets,
  statsBlockchains,
  swapStats,
  txns,
  volumeStats,
};
