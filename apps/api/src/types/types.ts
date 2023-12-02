import { TransformOptions } from 'stream';

import { Request } from 'express';
import { SafeParseSuccess } from 'zod';
import { Stringifier } from 'csv-stringify';

import { VerificationKind } from '#ts/enums';

export interface RequestValidators<T> extends Request {
  validator?: SafeParseSuccess<T>;
}

export type RequestValidator<T> = Required<RequestValidators<T>>;

export type Config = {
  port: number;
  dbUrl: string;
  redisUrl: string;
  mainnetDbUrl: string;
  mainnetRedisUrl: string;
  rpcUrl: string;
  sentryDsn?: string;
  network: string;
  maxQueryRows: number;
  maxQueryCost: number;
  apiFetchKey: string;
  apiOrigin: string;
};

export type StreamTransformWrapper = (
  stringifier: Stringifier,
) => TransformOptions['transform'];

export type User = {
  id: number;
  stripe_cid?: string;
  email: string;
  username: string;
  verified: boolean;
  last_login_at: string;
  plan?: Plan;
  keys?: Key[];
  verification?: Verification;
};

export type Plan = {
  id: number;
  stripe_pid?: string;
  stripe_mpid?: string;
  stripe_ypid?: string;
  title: string;
  limit_per_second: number;
  limit_per_minute: number;
  limit_per_day: number;
  limit_per_month: number;
  price_monthly: number;
  price_annually: number;
};

export type Key = {
  id: number;
  name: string;
  token: number;
  created_at: string;
  updated_at: string;
  user?: User;
};

export type Verification = {
  id: number;
  type: VerificationKind;
  email: string;
  code: string;
  expires_at: string;
  created_at: string;
  user?: User;
};

export type ValidationError = {
  message: string;
  path: string;
};
export type ExpProtocolConfig = {
  avg_hidden_validator_seats_per_shard: number[];
  epoch_length: number;
  num_block_producer_seats: number;
  protocol_version: number;
};

export type CurrentEpochValidatorInfo = {
  account_id: string;
  public_key: string;
  is_slashed: boolean;
  stake: string;
  shards: number;
  num_produced_blocks: number;
  num_expected_blocks: number;
  num_produced_chunks: number;
  num_expected_chunks: number;
};

export type NextEpochValidatorInfo = {
  account_id: string;
  public_key: string;
  stake: string;
  shards: number;
};

export type ValidatorStakeViewV1 = {
  account_id: string;
  public_key: string;
  stake: string;
};

export type ValidatorKickoutReason =
  | 'Slashed'
  | {
      NotEnoughBlocks: {
        produced: number;
        expected: number;
      };
    }
  | {
      NotEnoughChunks: {
        produced: number;
        expected: number;
      };
    }
  | { Unstaked: {} }
  | {
      NotEnoughStake: {
        stake: string;
        threshold: string;
      };
    }
  | { DidNotGetASeat: {} };

export type ValidatorKickoutView = {
  account_id: string;
  reason: ValidatorKickoutReason;
};

export type EpochValidatorInfo = {
  current_validators: Array<CurrentEpochValidatorInfo>;
  next_validators: Array<NextEpochValidatorInfo>;
  current_fishermen: ValidatorStakeViewV1;
  next_fishermen: ValidatorStakeViewV1;
  current_proposals: Array<ValidatorStakeViewV1>;
  prev_epoch_kickout: ValidatorKickoutView;
  epoch_start_height: number;
  epoch_height: number;
};

export type ValidationProgress = {
  chunks: {
    produced: number;
    total: number;
  };
  blocks: {
    produced: number;
    total: number;
  };
};

export type ValidatorEpochData = {
  accountId: string;
  publicKey?: string;

  currentEpoch?: {
    stake: string;
    progress: ValidationProgress;
  };
  nextEpoch?: {
    stake: string;
  };
  afterNextEpoch?: {
    stake: string;
  };
};

export type ValidatorTelemetry = {
  ipAddress: string;
  nodeId: string;
  lastSeen: number;
  lastHeight: number;
  agentName: string;
  agentVersion: string;
  agentBuild: string;
  status: string;
  latitude: string | null;
  longitude: string | null;
  city: string | null;
};

export type ValidatorPoolInfo = {
  fee: { numerator: number; denominator: number } | null;
  delegatorsCount: number | null;
};

export type ValidatorDescription = {
  country?: string;
  countryCode?: string;
  description?: string;
  discord?: string;
  email?: string;
  twitter?: string;
  url?: string;
};

export type ValidatorSortFn = (
  a: ValidatorFullData,
  b: ValidatorFullData,
) => number;

export type ValidatorFullData = ValidatorEpochData & {
  telemetry?: ValidatorTelemetry;
  poolInfo?: ValidatorPoolInfo;
  description?: ValidatorDescription;
  contractStake?: string;
};
