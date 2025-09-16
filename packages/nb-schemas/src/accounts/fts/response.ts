import * as v from 'valibot';

import { EventCause } from 'nb-types';

import { responseSchema } from '../../common.js';

const block = v.object({
  block_hash: v.optional(v.string()),
  block_height: v.optional(v.string()),
  block_timestamp: v.optional(v.string()),
});

const meta = v.object({
  contract: v.string(),
  decimals: v.nullable(v.number()),
  icon: v.nullable(v.string()),
  name: v.nullable(v.string()),
  reference: v.nullable(v.string()),
  symbol: v.nullable(v.string()),
});

const ft = v.object({
  affected_account_id: v.string(),
  block: v.optional(block),
  block_timestamp: v.string(),
  cause: v.enum(EventCause),
  contract_account_id: v.string(),
  delta_amount: v.string(),
  event_index: v.number(),
  event_type: v.number(),
  involved_account_id: v.nullable(v.string()),
  meta: v.optional(meta),
  receipt_id: v.string(),
  shard_id: v.number(),
  transaction_hash: v.optional(v.string()),
});

const ftCount = v.object({
  cost: v.string(),
  count: v.string(),
});

const ftsResponse = responseSchema(
  v.array(
    v.omit(ft, ['block_timestamp', 'shard_id', 'event_type', 'event_index']),
  ),
);
const ftCountResponse = responseSchema(v.omit(ftCount, ['cost']));

export type AccountFTTxn = v.InferOutput<typeof ft>;
export type AccountFTTxnCount = v.InferOutput<typeof ftCount>;

export type AccountFTTxnsRes = v.InferOutput<typeof ftsResponse>;
export type AccountFTTxnCountRes = v.InferOutput<typeof ftCountResponse>;

export default {
  count: ftCountResponse,
  fts: ftsResponse,
};
