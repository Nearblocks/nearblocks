import {
  AccessKeyPermissionKind,
  ActionKind,
  ExecutionOutcomeStatus,
  FtEventKind,
  Network,
  NftEventKind,
  ReceiptKind,
} from '#types/enums';

export type AccessKey = {
  account_id: string;
  created_by_receipt_id: null | string;
  deleted_by_receipt_id: null | string;
  last_update_block_height: number;
  permission_kind: AccessKeyPermissionKind;
  public_key: string;
};

export type Account = {
  account_id: string;
  created_by_receipt_id: null | string;
  deleted_by_receipt_id: null | string;
  last_update_block_height: number;
};

export type ActionReceiptAction = {
  action_kind: ActionKind;
  args: JsonValue;
  index_in_action_receipt: number;
  receipt_id: string;
  receipt_included_in_block_timestamp: string;
  receipt_predecessor_account_id: string;
  receipt_receiver_account_id: string;
};

export type ActionReceiptOutputData = {
  output_data_id: string;
  output_from_receipt_id: string;
  receiver_account_id: string;
};

export type AssetsFungibleTokenEvent = {
  amount: string;
  emitted_at_block_timestamp: string;
  emitted_by_contract_account_id: string;
  emitted_for_event_type: number;
  emitted_for_receipt_id: string;
  emitted_in_shard_id: number;
  emitted_index_of_event_entry_in_shard: number;
  event_kind: FtEventKind;
  event_memo: string;
  token_new_owner_account_id: string;
  token_old_owner_account_id: string;
};

export type AssetsNonFungibleTokenEvent = {
  emitted_at_block_timestamp: string;
  emitted_by_contract_account_id: string;
  emitted_for_event_type: number;
  emitted_for_receipt_id: string;
  emitted_in_shard_id: number;
  emitted_index_of_event_entry_in_shard: number;
  event_kind: NftEventKind;
  event_memo: string;
  token_authorized_account_id: string;
  token_id: string;
  token_new_owner_account_id: string;
  token_old_owner_account_id: string;
};

export type Block = {
  author_account_id: string;
  block_hash: string;
  block_height: number;
  block_timestamp: string;
  gas_price: string;
  prev_block_hash: string;
  total_supply: string;
};

export type Chunk = {
  author_account_id: string;
  chunk_hash: string;
  gas_limit: number;
  gas_used: number;
  included_in_block_hash: string;
  shard_id: number;
  signature: string;
};

export type DailyStats = {
  addresses: number;
  avg_gas_limit: number;
  avg_gas_price: string;
  blocks: number;
  date: string;
  gas_fee: string;
  gas_used: string;
  market_cap: number;
  near_price: number;
  total_addresses: number;
  total_supply: string;
  txn_fee: string;
  txn_fee_usd: number;
  txn_volume: string;
  txn_volume_usd: number;
  txns: number;
};

export type ErrorContract = {
  attempts: number;
  contract: string;
  id: string;
  token: null | string;
  type: string;
};

export type ExecutionOutcomeReceipt = {
  executed_receipt_id: string;
  index_in_execution_outcome: number;
  produced_receipt_id: string;
};

export type ExecutionOutcome = {
  executed_in_block_hash: string;
  executed_in_block_timestamp: string;
  executor_account_id: string;
  gas_burnt: number;
  index_in_chunk: number;
  logs: JsonValue;
  receipt_id: string;
  shard_id: number;
  status: ExecutionOutcomeStatus;
  tokens_burnt: string;
};

export type FtMeta = {
  change_24: null | number;
  circulating_supply: null | string;
  coingecko_id: null | string;
  coinmarketcap_id: null | string;
  contract: string;
  decimals: number;
  description: null | string;
  facebook: null | string;
  fully_diluted_market_cap: null | string;
  icon: null | string;
  livecoinwatch_id: null | string;
  market_cap: null | string;
  name: string;
  price: null | number;
  price_btc: null | number;
  price_eth: null | number;
  reddit: null | string;
  reference: null | string;
  reference_hash: null | string;
  rpccall_at: string;
  searched_at: string;
  spec: null | string;
  symbol: string;
  telegram: null | string;
  total_supply: number;
  twitter: null | string;
  updated_at: string;
  volume_24h: null | number;
  website: null | string;
};

export type NftMeta = {
  base_uri: null | string;
  contract: string;
  description: null | string;
  facebook: null | string;
  icon: null | string;
  name: string;
  reddit: null | string;
  reference: null | string;
  reference_hash: null | string;
  spec: null | string;
  symbol: string;
  telegram: null | string;
  twitter: null | string;
  website: null | string;
};

export type NftTokenMeta = {
  contract: string;
  copies: null | number;
  description: null | string;
  extra: null | string;
  media: null | string;
  media_hash: null | string;
  reference: null | string;
  reference_hash: null | string;
  title: null | string;
  token: string;
};

export type Receipt = {
  included_in_block_hash: string;
  included_in_block_timestamp: string;
  included_in_chunk_hash: string;
  index_in_chunk: number;
  originated_from_transaction_hash: string;
  predecessor_account_id: string;
  receipt_id: string;
  receipt_kind: ReceiptKind;
  receiver_account_id: string;
};

export type Setting = {
  key: string;
  value: JsonObject;
};

export type Stats = {
  avg_block_time?: number;
  block?: number;
  change_24?: number;
  gas_price?: string;
  high_24h?: number;
  high_all?: number;
  low_24h?: number;
  low_all?: number;
  market_cap?: number;
  near_btc_price?: number;
  near_price?: number;
  nodes?: number;
  nodes_online?: number;
  total_supply?: string;
  total_txns?: number;
  volume?: number;
};

export type Transaction = {
  block_timestamp: string;
  converted_into_receipt_id: string;
  included_in_block_hash: string;
  included_in_chunk_hash: string;
  index_in_chunk: number;
  nonce: number;
  receipt_conversion_gas_burnt: number;
  receipt_conversion_tokens_burnt: string;
  receiver_account_id: string;
  signature: string;
  signer_account_id: string;
  signer_public_key: string;
  status: ExecutionOutcomeStatus;
  transaction_hash: string;
};

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

export interface Config {
  cmcApiKey: string;
  coingeckoApiKey?: string;
  dbUrl: string;
  genesisDate: string;
  genesisHeight: number;
  lcwApiKey: string;
  network: Network;
  rpcUrl: string;
  sentryDsn?: string;
}

export type FtMetadata = {
  decimals: number;
  icon: null | string;
  name: string;
  reference: null | string;
  reference_hash: null | string;
  spec: string;
  symbol: string;
};

export type NftMetadata = {
  base_uri: null | string;
  icon: null | string;
  name: string;
  reference: null | string;
  reference_hash: null | string;
  spec: string;
  symbol: string;
};

export type NftTokenInfo = {
  metadata: NftTokenMetadata;
  owner_id: string;
  token_id: string;
};

export type NftTokenMetadata = {
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

export type FtMarketData = {
  change_24: null | number;
  circulating_supply: null | string;
  description: null | string;
  facebook: null | string;
  fully_diluted_market_cap: null | string;
  market_cap: null | string;
  price: null | number;
  price_btc: null | number;
  price_eth: null | number;
  reddit: null | string;
  telegram: null | string;
  twitter: null | string;
  volume_24h: null | number;
  website: null | string;
};
