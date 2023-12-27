import { Dayjs } from 'dayjs';

import { BlockHeader, EpochValidatorInfo } from 'nb-near';
import {
  FTEvent,
  LatestBlock,
  Network,
  ProtocolConfig,
  ValidatorEpochData,
  ValidatorFullData,
  ValidatorPoolInfo,
} from 'nb-types';

export interface Config {
  cmcApiKey: string;
  coingeckoApiKey?: string;
  dbCa: string;
  dbCert: string;
  dbKey: string;
  dbUrl: string;
  genesisDate: string;
  genesisHeight: number;
  lcwApiKey: string;
  network: Network;
  redisUrl: string;
  rpcUrl: string;
  rpcUrl2: string;
  sentryDsn?: string;
}

export type SnapshotStartParams = {
  date: Dayjs;
  index: null | string;
};

export type SnapshotEvent = Pick<
  FTEvent,
  'affected_account_id' | 'block_height' | 'contract_account_id' | 'event_index'
>;

export type ExpProtocolConfig = {
  avg_hidden_validator_seats_per_shard: number[];
  epoch_length: number;
  num_block_producer_seats: number;
  protocol_version: number;
};

export type NextEpochValidatorInfo = {
  account_id: string;
  public_key: string;
  shards: number;
  stake: string;
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
        expected: number;
        produced: number;
      };
    }
  | {
      NotEnoughChunks: {
        expected: number;
        produced: number;
      };
    }
  | {
      NotEnoughStake: {
        stake: string;
        threshold: string;
      };
    }
  | { DidNotGetASeat: string }
  | { Unstaked: string };

export type ValidatorKickoutView = {
  account_id: string;
  reason: ValidatorKickoutReason;
};

export type ValidatorSortFn = (
  a: ValidatorFullData,
  b: ValidatorFullData,
) => number;

export type EpochBlock = {
  header: {
    height: number;
    timestamp: number;
    total_supply: string;
  };
};

export interface ExpGenesisConfig {
  genesis_height: number;
  genesis_time: string;
  minimum_stake_ratio: number[];
  protocol_version: number;
  total_supply: string;
}

export interface CallFunctionResponse {
  block_hash: string;
  block_height: number;
  logs: [];
  result: [];
}

export interface AccountResponse {
  amount: string;
  block_hash: string;
  block_height: number;
  code_hash: string;
  locked: string;
  storage_usage: number;
}

export type CachedTimestampMap<T> = {
  promisesMap: Map<string, Promise<void>>;
  timestampMap: Map<string, number>;
  valueMap: Map<string, T>;
};

export type CronTaskTypes = {
  epochStartBlock: BlockHeader;
  EpochValidatorInfo: EpochValidatorInfo;
  latestBlock: LatestBlock;
  protocolConfig: ProtocolConfig;
  stakingPoolInfos: CachedTimestampMap<ValidatorPoolInfo>;
  stakingPoolStakeProposalsFromContract: CachedTimestampMap<string>;
  validators: ValidatorEpochData[];
  validatorsPromise: EpochValidatorInfo;
};

export type CronTaskType = keyof CronTaskTypes;

export type CronTaskMap = {
  [S in CronTaskType]: (
    nextOutput: CronTaskTypes[S],
    prevOutput?: CronTaskTypes[S],
  ) => void;
};

export type PublishTopic = <S extends keyof CronTaskMap>(
  event: S,
  arg: CronTaskTypes[S],
) => void;

export type RegularCheckFn = {
  fn: (publish: PublishTopic) => Promise<void>;
};

export interface StakingPoolStakeProposals {
  valueMap: Map<string, number>;
}

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
  status: string;
};
