import { types } from 'near-lake-framework';

import { Knex } from 'nb-knex';
import { EventCause, Network } from 'nb-types';

export type Config = {
  cacheExpiry: number;
  dbUrl: string;
  delta: number;
  insertLimit: number;
  network: Network;
  preloadSize: number;
  redisUrl: string;
  rpcUrl: string;
  s3BucketName: string;
  s3RegionName: string;
  sentryDsn?: string;
  startBlockHeight: number;
};

export type EventDataEvent = {
  data: EventReceiptData;
  event: FTEventLogs | NFTEventLogs;
};

export type EventReceiptData = {
  contractId: string;
  receiptId: string;
};

export type FTEventLogs = FTBurnEventLog | FTMintEventLog | FTTransferEventLog;

export type NFTEventLogs =
  | NFTBurnEventLog
  | NFTMintEventLog
  | NFTTransferEventLog;

export interface FTMintEventLog {
  data: FTMintLog[];
  event: 'ft_mint';
  standard: string;
  version: string;
}

export interface FTBurnEventLog {
  data: FTBurnLog[];
  event: 'ft_burn';
  standard: string;
  version: string;
}

export interface FTTransferEventLog {
  data: FTTransferLog[];
  event: 'ft_transfer';
  standard: string;
  version: string;
}

export interface NFTMintEventLog {
  data: NFTMintLog[];
  event: 'nft_mint';
  standard: string;
  version: string;
}

export interface NFTBurnEventLog {
  data: NFTBurnLog[];
  event: 'nft_burn';
  standard: string;
  version: string;
}

export interface NFTTransferEventLog {
  data: NFTTransferLog[];
  event: 'nft_transfer';
  standard: string;
  version: string;
}

export interface FTMintLog {
  amount: string;
  memo?: string;
  owner_id: string;
}

export interface FTBurnLog {
  amount: string;
  memo?: string;
  owner_id: string;
}

export interface FTTransferLog {
  amount: string;
  memo?: string;
  new_owner_id: string;
  old_owner_id: string;
}

export interface NFTMintLog {
  memo?: string;
  owner_id: string;
  token_ids: string[];
}

export interface NFTBurnLog {
  authorized_id?: string;
  memo?: string;
  owner_id: string;
  token_ids: string[];
}

export interface NFTTransferLog {
  authorized_id?: string;
  memo?: string;
  new_owner_id: string;
  old_owner_id: string;
  token_ids: string[];
}

export type EventContract = (param: EventContractParam) => Promise<void>;

export type EventContractParam = {
  blockHeader: types.BlockHeader;
  knex: Knex;
  outcomes: types.ExecutionOutcomeWithReceipt[];
  shardId: number;
};

export type FTContractMatchAction = (
  action: types.FunctionCallAction,
  predecessor: string,
  logs: string[],
  status?: types.ExecutionStatus,
) => FTEventEntry[];

export type FTEventEntry = {
  affected: string;
  amount: string;
  cause: EventCause;
  involved: null | string;
  memo: null | string;
};

export type FTTransferArgs = {
  amount: string;
  memo?: string;
  receiver_id: string;
};

export type FTTransferCallArgs = {
  amount: string;
  memo?: string;
  msg: string;
  receiver_id: string;
};

export type FTResolveTransferArgs = {
  amount: string;
  receiver_id: string;
  sender_id: string;
};

export type FTMetaArgs = {
  metadata: FTMeta;
  owner_id: string;
  total_supply: string;
};

export type FTMetaArgsRefToken = {
  owner: string;
  total_supply: string;
};

export type FTMeta = {
  decimals: number;
  icon: string | undefined;
  name: string;
  reference: string | undefined;
  reference_hash: string | undefined;
  spec: string;
  symbol: string;
};

export type AccountTokenBalance = {
  accountId: string;
  balance: string;
  contractId: string;
};
