import {
  BlockHeader,
  ExecutionOutcomeWithReceipt,
  ExecutionStatus,
  FunctionCallAction,
} from 'nb-blocks-minio';
import { Knex } from 'nb-knex';
import { EventCause, Network } from 'nb-types';

export type Config = {
  dbCa: string;
  dbCert: string;
  dbKey: string;
  dbUrl: string;
  dbUrlBase: string;
  indexerKey: string;
  network: Network;
  s3AccessKey: string;
  s3Bucket: string;
  s3Host: string;
  s3Port: number;
  s3SecretKey: string;
  s3UseSsl: boolean;
  sentryDsn?: string;
  startBlockHeight: number;
};

export type EventDataEvent = {
  data: EventReceiptData;
  event: EventLogs;
};

export type EventReceiptData = {
  contractId: string;
  receiptId: string;
};

export type EventLogs = FTEventLogs | MTEventLogs | NFTEventLogs;

export type FTEventLogs = FTBurnEventLog | FTMintEventLog | FTTransferEventLog;

export type NFTEventLogs =
  | NFTBurnEventLog
  | NFTMintEventLog
  | NFTTransferEventLog;

export type MTEventLogs = MTBurnEventLog | MTMintEventLog | MTTransferEventLog;

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

export interface MTMintEventLog {
  data: MTMintLog[];
  event: 'mt_mint';
  standard: string;
  version: string;
}

export interface MTBurnEventLog {
  data: MTBurnLog[];
  event: 'mt_burn';
  standard: string;
  version: string;
}

export interface MTTransferEventLog {
  data: MTTransferLog[];
  event: 'mt_transfer';
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

export interface MTMintLog {
  amounts: string[];
  memo?: string;
  owner_id: string;
  token_ids: string[];
}

export interface MTBurnLog {
  amounts: string[];
  authorized_id?: string;
  memo?: string;
  owner_id: string;
  token_ids: string[];
}

export interface MTTransferLog {
  amounts: string[];
  authorized_id?: string;
  memo?: string;
  new_owner_id: string;
  old_owner_id: string;
  token_ids: string[];
}

export type EventContract = (param: EventContractParam) => Promise<void>;

export type EventContractParam = {
  blockHeader: BlockHeader;
  knex: Knex;
  outcomes: ExecutionOutcomeWithReceipt[];
  shardId: number;
};

export type FTContractMatchAction = (
  action: FunctionCallAction,
  predecessor: string,
  logs: string[],
  status?: ExecutionStatus,
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
