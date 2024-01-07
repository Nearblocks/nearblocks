export type JsonObject = { [Key in string]?: JsonValue };

export interface JsonArray {
  [index: number]: JsonValue;
}

export type JsonValue =
  | boolean
  | JsonArray
  | JsonObject
  | null
  | number
  | string;

export type CurrentEpochValidatorInfo = {
  account_id: string;
  is_slashed: boolean;
  num_expected_blocks: number;
  num_expected_chunks: number;
  num_produced_blocks: number;
  num_produced_chunks: number;
  public_key: string;
  shards: number;
  stake: string;
};

export type ValidationProgress = {
  blocks: {
    produced: number;
    total: number;
  };
  chunks: {
    produced: number;
    total: number;
  };
};

export type PoolInfo = {
  accountId?: string;
  delegatorsCount?: number;
  fee?: {
    denominator: number;
    numerator: number;
  };
};

export type ValidatorPoolInfo = {
  delegatorsCount: null | number;
  fee: { denominator: number; numerator: number } | null;
};

type cumilativeStakeInfo = {
  accumulatedPercent: number;
  cumulativePercent: number;
  ownPercentage: number;
};

type stakeChange = {
  symbol: string;
  value: string;
};

export type ValidatorEpochData = {
  accountId: string;
  afterNextEpoch?: {
    stake: string;
  };

  contractStake?: string;
  cumilativeStake?: cumilativeStakeInfo;
  currentEpoch?: {
    progress: ValidationProgress;
    stake: string;
  };
  description?: ValidatorDescription;
  index?: number;
  isExpanded?: string;
  nextEpoch?: {
    stake: string;
  };
  percent?: number;
  poolInfo?: ValidatorPoolInfo;
  publicKey?: string;
  showWarning?: boolean;
  stakeChange?: stakeChange;
  stakingStatus?: string;
  warning?: string;
};

export type ValidatorTelemetry = {
  agentBuild: string;
  agentName: string;
  agentVersion: string;
  city: null | string;
  ipAddress: string;
  lastHeight: number;
  lastSeen: number;
  latitude: null | string;
  longitude: null | string;
  nodeId: string;
  showWarning?: boolean;
  status: string;
  warning?: string;
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

export type ValidatorFullData = ValidatorEpochData & {
  contractStake?: string;
  description?: ValidatorDescription;
  poolInfo?: ValidatorPoolInfo;
  telemetry?: ValidatorTelemetry;
};

export interface LatestBlock {
  height: number;
  timestamp: number;
}

export interface ProtocolConfig {
  epochLength: number;
  maxNumberOfSeats: number;
  version: number;
}
