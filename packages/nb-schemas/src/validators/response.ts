import * as v from 'valibot';

import { responseSchema } from '../common.js';

const validator = v.object({
  account_id: v.string(),
  accumulated_stake_percent: v.nullable(v.string()),
  after_next_epoch_stake: v.nullable(v.string()),
  city: v.nullable(v.string()),
  contract_stake: v.nullable(v.string()),
  country: v.nullable(v.string()),
  country_code: v.nullable(v.string()),
  cumulative_stake_percent: v.nullable(v.string()),
  current_epoch_blocks_expected: v.nullable(v.number()),
  current_epoch_blocks_produced: v.nullable(v.number()),
  current_epoch_chunks_expected: v.nullable(v.number()),
  current_epoch_chunks_produced: v.nullable(v.number()),
  current_epoch_stake: v.nullable(v.string()),
  delegators_count: v.nullable(v.number()),
  description: v.nullable(v.string()),
  discord: v.nullable(v.string()),
  email: v.nullable(v.string()),
  fee_denominator: v.nullable(v.number()),
  fee_numerator: v.nullable(v.number()),
  github: v.nullable(v.string()),
  is_network_holder_warning: v.nullable(v.boolean()),
  logo: v.nullable(v.string()),
  name: v.nullable(v.string()),
  next_epoch_stake: v.nullable(v.string()),
  own_stake_percent: v.nullable(v.string()),
  public_key: v.nullable(v.string()),
  stake_change_symbol: v.nullable(v.string()),
  stake_change_value: v.nullable(v.string()),
  staking_status: v.nullable(v.string()),
  telegram: v.nullable(v.string()),
  twitter: v.nullable(v.string()),
  url: v.nullable(v.string()),
});

const validatorInfo = v.object({
  current_validators_count: v.nullable(v.number()),
  epoch_seat_price: v.nullable(v.string()),
  epoch_start_height: v.nullable(v.string()),
  epoch_start_timestamp: v.nullable(v.string()),
  epoch_start_total_supply: v.nullable(v.string()),
  last_epoch_apy: v.nullable(v.string()),
  latest_block_height: v.nullable(v.string()),
  latest_block_timestamp: v.nullable(v.string()),
  network_holder_index: v.nullable(v.number()),
  next_epoch_seat_price: v.nullable(v.string()),
  protocol_epoch_length: v.nullable(v.number()),
  protocol_version: v.nullable(v.number()),
  total_stake: v.nullable(v.string()),
  total_validators_count: v.nullable(v.number()),
});

const blockStat = v.object({
  author: v.string(),
  blocks: v.string(),
  date: v.string(),
});

const chunkStat = v.object({
  author: v.string(),
  chunks: v.string(),
  date: v.string(),
});

const listResponse = responseSchema(v.array(validator));
const infoResponse = responseSchema(validatorInfo);
const detailResponse = responseSchema(validator);
const blockStatResponse = responseSchema(v.array(blockStat));
const chunkStatResponse = responseSchema(v.array(chunkStat));

export type Validator = v.InferOutput<typeof validator>;
export type ValidatorInfo = v.InferOutput<typeof validatorInfo>;
export type ValidatorBlockStats = v.InferOutput<typeof blockStat>;
export type ValidatorChunkStats = v.InferOutput<typeof chunkStat>;

export type ValidatorsListRes = v.InferOutput<typeof listResponse>;
export type ValidatorInfoRes = v.InferOutput<typeof infoResponse>;
export type ValidatorDetailRes = v.InferOutput<typeof detailResponse>;
export type ValidatorBlockStatsRes = v.InferOutput<typeof blockStatResponse>;
export type ValidatorChunkStatsRes = v.InferOutput<typeof chunkStatResponse>;

export default {
  blocks: blockStatResponse,
  chunks: chunkStatResponse,
  detail: detailResponse,
  info: infoResponse,
  list: listResponse,
};
