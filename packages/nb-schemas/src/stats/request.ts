import * as v from 'valibot';

import { limit } from '../common.js';

const daily = v.object({
  date: v.optional(v.pipe(v.string(), v.isoDate())),
  limit: v.optional(limit(365)),
});

const signer = v.object({
  date: v.optional(v.pipe(v.string(), v.isoDate())),
  limit: v.optional(limit(365)),
});

const tps = v.object({
  limit: v.optional(limit(60)),
});

export type DailyStatsReq = v.InferOutput<typeof daily>;
export type SignerStatsReq = v.InferOutput<typeof signer>;
export type TpsStatsReq = v.InferOutput<typeof tps>;

export default { daily, signer, tps };
