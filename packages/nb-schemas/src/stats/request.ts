import * as v from 'valibot';

import { limit } from '../common.js';

const block = v.object({
  date: v.optional(v.pipe(v.string(), v.isoDate())),
  limit: v.optional(limit(365)),
});

const txn = v.object({
  date: v.optional(v.pipe(v.string(), v.isoDate())),
  limit: v.optional(limit(365)),
});

const address = v.object({
  date: v.optional(v.pipe(v.string(), v.isoDate())),
  limit: v.optional(limit(365)),
});

const price = v.object({
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

export type SignerStatsReq = v.InferOutput<typeof signer>;
export type TpsStatsReq = v.InferOutput<typeof tps>;
export type BlockStatsReq = v.InferOutput<typeof block>;
export type TxnStatsReq = v.InferOutput<typeof txn>;
export type AddressStatsReq = v.InferOutput<typeof address>;
export type PriceStatsReq = v.InferOutput<typeof price>;

export default { address, block, price, signer, tps, txn };
