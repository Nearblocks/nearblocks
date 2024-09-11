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
  redisPassword: string;
  redisSentinelName: string;
  redisSentinelUrls: string;
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

export interface GenesisConfig {
  accountCount: string;
  height: number;
  minStakeRatio: number[];
  protocolVersion: number;
  timestamp: number;
  totalSupply: string;
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

export interface StakingPoolStakeProposals {
  valueMap: Map<string, number>;
}

export type FTCoin = {
  contract: string;
  id: string;
};

export type CGCoin = {
  id: string;
  platforms: {
    [key: string]: string;
  };
};

export type FTMarketData = {
  change_24: null | string;
  circulating_supply: null | string;
  description: null | string;
  facebook: null | string;
  fully_diluted_market_cap: null | string;
  high_24h?: null | string;
  high_all?: null | string;
  low_24h?: null | string;
  low_all?: null | string;
  market_cap: null | string;
  price: null | string;
  price_btc: null | string;
  price_eth: null | string;
  reddit: null | string;
  telegram: null | string;
  twitter: null | string;
  volume_24h: null | string;
  website: null | string;
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
  status: string;
};

export type PoolMetadataAccountInfo = {
  city?: string;
  country?: string;
  country_code: string;
  description?: string;
  discord?: string;
  email?: string;
  github?: string;
  logo?: string;
  name?: string;
  telegram?: string;
  twitter?: string;
  url?: string;
};

export type FTMetadata = {
  decimals: number;
  icon: null | string;
  name: string;
  reference: null | string;
  reference_hash: null | string;
  spec: string;
  symbol: string;
};

export type NFTMetadata = {
  base_uri: null | string;
  icon: null | string;
  name: string;
  reference: null | string;
  reference_hash: null | string;
  spec: string;
  symbol: string;
};

export type NFTTokenInfo = {
  metadata: NFTTokenMetadata;
  owner_id: string;
  token_id: string;
};

export type NFTTokenMetadata = {
  copies: null | number;
  description: null | string;
  expires_at: null | number;
  extra: null | string;
  issued_at: null | number;
  media: null | string;
  media_hash: null | string;
  reference: null | string;
  reference_hash: null | string;
  starts_at: null | number;
  title: null | string;
  updated_at: null | number;
};
