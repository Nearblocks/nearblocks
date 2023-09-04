import { Knex } from 'knex';
import { types } from 'near-lake-framework';

import { EventType } from '#services/events';
import {
  Network,
  ActionKind,
  FtEventKind,
  ReceiptKind,
  NftEventKind,
  ExecutionOutcomeStatus,
  AccessKeyPermissionKind,
} from '#ts/enums';

export type AccessKey = {
  public_key: string;
  account_id: string;
  created_by_receipt_id: string | null;
  deleted_by_receipt_id: string | null;
  permission_kind: AccessKeyPermissionKind;
  last_update_block_height: number;
};

export type Account = {
  account_id: string;
  created_by_receipt_id: string | null;
  deleted_by_receipt_id: string | null;
  last_update_block_height: number;
};

export type ActionReceiptAction = {
  receipt_id: string;
  index_in_action_receipt: number;
  receipt_predecessor_account_id: string;
  receipt_receiver_account_id: string;
  receipt_included_in_block_timestamp: string;
  action_kind: ActionKind;
  args: JsonValue;
};

export type ActionReceiptOutputData = {
  output_from_receipt_id: string;
  output_data_id: string;
  receiver_account_id: string;
};

export type AssetsFungibleTokenEvent = {
  emitted_for_receipt_id: string;
  emitted_at_block_timestamp: string;
  emitted_in_shard_id: number;
  emitted_for_event_type: number;
  emitted_index_of_event_entry_in_shard: number;
  emitted_by_contract_account_id: string;
  amount: string;
  event_kind: FtEventKind;
  token_old_owner_account_id: string;
  token_new_owner_account_id: string;
  event_memo: string;
};

export type AssetsNonFungibleTokenEvent = {
  emitted_for_receipt_id: string;
  emitted_at_block_timestamp: string;
  emitted_in_shard_id: number;
  emitted_for_event_type: number;
  emitted_index_of_event_entry_in_shard: number;
  emitted_by_contract_account_id: string;
  token_id: string;
  event_kind: NftEventKind;
  token_old_owner_account_id: string;
  token_new_owner_account_id: string;
  token_authorized_account_id: string;
  event_memo: string;
};

export type Block = {
  block_height: number;
  block_hash: string;
  prev_block_hash: string;
  block_timestamp: string;
  total_supply: string;
  gas_price: string;
  author_account_id: string;
};

export type Chunk = {
  included_in_block_hash: string;
  chunk_hash: string;
  shard_id: number;
  signature: string;
  gas_limit: number;
  gas_used: number;
  author_account_id: string;
};

export type ExecutionOutcomeReceipt = {
  executed_receipt_id: string;
  index_in_execution_outcome: number;
  produced_receipt_id: string;
};

export type ExecutionOutcome = {
  executed_in_block_hash: string;
  executed_in_block_timestamp: string;
  index_in_chunk: number;
  receipt_id: string;
  gas_burnt: number;
  tokens_burnt: string;
  executor_account_id: string;
  status: ExecutionOutcomeStatus;
  shard_id: number;
  logs: JsonValue;
};

export type Receipt = {
  receipt_id: string;
  included_in_block_hash: string;
  included_in_chunk_hash: string;
  index_in_chunk: number;
  included_in_block_timestamp: string;
  predecessor_account_id: string;
  receiver_account_id: string;
  receipt_kind: ReceiptKind;
  originated_from_transaction_hash: string;
};

export type Setting = {
  key: string;
  value: JsonObject;
};

export type Transaction = {
  transaction_hash: string;
  included_in_block_hash: string;
  included_in_chunk_hash: string;
  index_in_chunk: number;
  block_timestamp: string;
  signer_account_id: string;
  signer_public_key: string;
  nonce: number;
  receiver_account_id: string;
  signature: string;
  status: ExecutionOutcomeStatus;
  converted_into_receipt_id: string;
  receipt_conversion_gas_burnt: number;
  receipt_conversion_tokens_burnt: string;
};

export type JsonObject = { [Key in string]?: JsonValue };

export interface JsonArray {
  [index: number]: JsonValue;
}

export type JsonValue =
  | string
  | number
  | boolean
  | JsonObject
  | JsonArray
  | null;

export interface Config {
  dbUrl: string;
  redisUrl: string;
  network: Network;
  genesisFile: string;
  genesisHeight: number;
  cacheExpiry: number;
  insertLimit: number;
  delta: number;
  preloadSize: number;
  s3BucketName: string;
  s3RegionName: string;
  sentryDsn?: string;
}

export type ActionReceipt = {
  Action: {
    actions: types.Action[];
    gasPrice: string;
    inputDataIds: string[];
    outputDataReceivers: DataReceiver[];
    signerId: string;
    signerPublicKey: string;
  };
};

export type DataReceiver = {
  receiverId: string;
  dataId: string;
};

export type DataReceipt = {
  Data: {
    data: string;
    dataId: string;
  };
};

export type ReceiptAction = {
  kind: ActionKind;
  args: string;
};

export type EventDataEvent = {
  receipt: EventReceiptData;
  event: FtEventLogs | NftEventLogs;
};

export type EventReceiptData = {
  receiptId: string;
  blockTimestamp: string;
  shardId: number;
  receiverId: string;
  eventType: EventType;
};

export type FtEventLogs = FtMintEventLog | FtBurnEventLog | FtTransferEventLog;

export interface FtMintEventLog {
  standard: string;
  version: string;
  event: 'ft_mint';
  data: FtMintLog[];
}

export interface FtBurnEventLog {
  standard: string;
  version: string;
  event: 'ft_burn';
  data: FtBurnLog[];
}

export interface FtTransferEventLog {
  standard: string;
  version: string;
  event: 'ft_transfer';
  data: FtTransferLog[];
}

export interface FtMintLog {
  owner_id: string;
  amount: string;
  memo?: string;
}

export interface FtBurnLog {
  owner_id: string;
  amount: string;
  memo?: string;
}

export interface FtTransferLog {
  old_owner_id: string;
  new_owner_id: string;
  amount: string;
  memo?: string;
}

export type FtEventEntry = {
  kind: FtEventKind;
  amount: string;
  from: string;
  to: string;
  memo: string;
};

export type FtTransferArgs = {
  receiver_id: string;
  amount: string;
  memo: string | undefined;
};

export type FtTransferCallArgs = {
  receiver_id: string;
  amount: string;
  msg: string;
  memo: string | undefined;
};

export type FtResolveTransferArgs = {
  sender_id: string;
  receiver_id: string;
  amount: string;
};

export type FtMetaArgs = {
  owner_id: string;
  total_supply: string;
  metadata: FtMeta;
};

export type FtMetaArgsRefToken = {
  owner: string;
  total_supply: string;
};

export type FtMeta = {
  spec: string;
  name: string;
  symbol: string;
  decimals: number;
  icon: string | undefined;
  reference: string | undefined;
  reference_hash: string | undefined;
};

export type NftEventLogs =
  | NftMintEventLog
  | NftBurnEventLog
  | NftTransferEventLog;

export interface NftMintEventLog {
  standard: string;
  version: string;
  event: 'nft_mint';
  data: NftMintLog[];
}

export interface NftBurnEventLog {
  standard: string;
  version: string;
  event: 'nft_burn';
  data: NftBurnLog[];
}

export interface NftTransferEventLog {
  standard: string;
  version: string;
  event: 'nft_transfer';
  data: NftTransferLog[];
}

export interface NftMintLog {
  owner_id: string;
  token_ids: string[];
  memo?: string;
}

export interface NftBurnLog {
  owner_id: string;
  authorized_id?: string;
  token_ids: string[];
  memo?: string;
}

export interface NftTransferLog {
  authorized_id?: string;
  old_owner_id: string;
  new_owner_id: string;
  token_ids: string[];
  memo?: string;
}

export type NftEventEntry = {
  kind: NftEventKind;
  token: string;
  from: string;
  to: string;
  author: string;
  memo: string;
};

export type NftTransferArgs = {
  receiver_id: string;
  token_id: string;
  approval_id: number | null;
  memo: string | null;
};

export type NftTransferCallArgs = {
  receiver_id: string;
  token_id: string;
  msg: string;
  approval_id: number | null;
  memo: string | null;
};

export type NftContractMetaArgs = {
  spec: string;
  name: string;
  symbol: string;
  icon: string | null;
  base_uri: string | null;
  reference: string | null;
  reference_hash: string | null;
};

export type TokenMetadata = {
  title: string | null;
  description: string | null;
  media: string | null;
  media_hash: string | null;
  copies: number | null;
  issued_at: number | null;
  expires_at: number | null;
  starts_at: number | null;
  updated_at: number | null;
  extra: string | null;
  reference: string | null;
  reference_hash: string | null;
};

export type EventContract = (
  knex: Knex,
  block: types.BlockHeader,
  shardId: number,
  outcome: types.ExecutionOutcomeWithReceipt,
) => Promise<void>;

export type AccessKeyPermission = {
  permission_kind: AccessKeyPermissionKind;
  permission_details?: {
    allowance: string;
    receiver_id: string;
    method_names: string[];
  };
};
