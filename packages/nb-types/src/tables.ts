import {
  AccessKeyPermissionKind,
  ActionKind,
  DexEventType,
  EventCause,
  EventStatus,
  ExecutionOutcomeStatus,
  ReceiptKind,
  StateChangeCause,
  StateChangeDirection,
} from './enums.js';
import { JsonObject, JsonValue } from './types.js';

export interface TTables {
  access_keys: AccessKey;
  accounts: Account;
  action_receipt_actions: ActionReceiptAction;
  action_receipt_input_data: ActionReceiptInputData;
  action_receipt_output_data: ActionReceiptOutputData;
  balance_events: BalanceEvent;
  blocks: Block;
  chunks: Chunk;
  daily_stats: DailyStats;
  deployed_contracts: DeployedContracts;
  dex_events: DexEvents;
  dex_pairs: DexPairs;
  errored_contracts: ErroredContracts;
  execution_outcome_receipts: ExecutionOutcomeReceipt;
  execution_outcomes: ExecutionOutcome;
  ft_events: FTEvent;
  ft_meta: FTMeta;
  nft_events: NFTEvent;
  nft_meta: NFTMeta;
  nft_token_meta: NFTTokenMeta;
  receipts: Receipt;
  settings: Setting;
  stats: Stats;
  tps: TPS;
  transactions: Transaction;
  validator_data: ValidatorData;
}

export type AccessKey = {
  account_id: string;
  created_by_block_height: number;
  created_by_receipt_id: null | string;
  deleted_by_block_height: null | number;
  deleted_by_receipt_id: null | string;
  permission_kind: AccessKeyPermissionKind;
  public_key: string;
};

export type Account = {
  account_id: string;
  created_by_block_height: number;
  created_by_receipt_id: null | string;
  deleted_by_block_height: null | number;
  deleted_by_receipt_id: null | string;
};

export type ActionReceiptAction = {
  action_kind: ActionKind;
  args: JsonValue;
  index_in_action_receipt: number;
  nep518_rlp_hash: null | string;
  receipt_id: string;
  receipt_included_in_block_timestamp: string;
  receipt_predecessor_account_id: string;
  receipt_receiver_account_id: string;
};

export type ActionReceiptInputData = {
  input_data_id: string;
  input_to_receipt_id: string;
};

export type ActionReceiptOutputData = {
  output_data_id: string;
  output_from_receipt_id: string;
  receiver_account_id: string;
};

export type BalanceEvent = {
  absolute_nonstaked_amount: string;
  absolute_staked_amount: string;
  affected_account_id: string;
  block_height: number;
  block_timestamp: string;
  cause: StateChangeCause;
  delta_nonstaked_amount: null | string;
  delta_staked_amount: null | string;
  direction: StateChangeDirection;
  event_index: string;
  involved_account_id: null | string;
  receipt_id: null | string;
  status: EventStatus;
  transaction_hash: null | string;
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
  included_in_block_timestamp: string;
  shard_id: number;
};

export type DailyStats = {
  active_accounts: null | string;
  active_contracts: null | string;
  blocks: null | string;
  circulating_supply: null | string;
  date: null | string;
  deleted_accounts: null | string;
  gas_fee: null | string;
  gas_used: null | string;
  market_cap: null | string;
  near_price: null | string;
  new_accounts: null | string;
  new_contracts: null | string;
  total_supply: null | string;
  txn_fee: null | string;
  txn_fee_usd: null | string;
  txn_volume: null | string;
  txn_volume_usd: null | string;
  txns: null | string;
  unique_contracts: null | string;
};

export type DeployedContracts = {
  block_hash: string;
  block_timestamp: string;
  code_sha256: string;
  contract: string;
  id: number;
  receipt_id: string;
};

export type DexEvents = {
  amount_usd: string;
  base_amount: string;
  event_index: string;
  maker: string;
  pair_id: string;
  price_token: string;
  price_usd: string;
  quote_amount: string;
  receipt_id: string;
  timestamp: string;
  type: DexEventType;
};

export type DexPairs = {
  base: string;
  contract: string;
  id?: string;
  pool: string;
  price_token: null | string;
  price_usd: null | string;
  quote: string;
  updated_at?: unknown;
};

export type ErroredContracts = {
  attempts: number;
  contract: string;
  id: number;
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
  receipt_id: string;
  shard_id: number;
  status: ExecutionOutcomeStatus;
  tokens_burnt: string;
};

export type FTEvent = {
  absolute_amount: null | string;
  affected_account_id: string;
  block_height: number;
  block_timestamp: string;
  cause: EventCause;
  contract_account_id: string;
  delta_amount: string;
  event_index: string;
  event_memo: null | string;
  involved_account_id: null | string;
  receipt_id: string;
  standard: string;
  status: EventStatus;
};

export type FTMeta = {
  change_24: null | string;
  circulating_supply: null | string;
  coingecko_id: null | string;
  coinmarketcap_id: null | string;
  contract: string;
  created_at: null | string;
  decimals: number;
  description: null | string;
  facebook: null | string;
  fully_diluted_market_cap: null | string;
  icon: null | string;
  livecoinwatch_id: null | string;
  market_cap: null | string;
  name: string;
  nep518_hex_address: null | string;
  price: null | string;
  price_btc: null | string;
  price_eth: null | string;
  reddit: null | string;
  reference: null | string;
  reference_hash: null | string;
  refreshed_at: null | string;
  searched_at: null | string;
  spec: null | string;
  symbol: string;
  synced_at: null | string;
  telegram: null | string;
  total_supply: null | string;
  twitter: null | string;
  updated_at: null | string;
  volume_24h: null | string;
  website: null | string;
};

export type NFTEvent = {
  affected_account_id: string;
  authorized_account_id: null | string;
  block_height: number;
  block_timestamp: string;
  cause: EventCause;
  contract_account_id: string;
  delta_amount: number;
  event_index: string;
  event_memo: null | string;
  involved_account_id: null | string;
  receipt_id: string;
  standard: string;
  status: EventStatus;
  token_id: string;
};

export type NFTMeta = {
  base_uri: null | string;
  contract: string;
  created_at: null | string;
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
  updated_at: null | string;
  website: null | string;
};

export type NFTTokenMeta = {
  contract: string;
  copies: null | number;
  description: null | string;
  expires_at: null | string;
  extra: null | string;
  issued_at: null | string;
  media: null | string;
  media_hash: null | string;
  reference: null | string;
  reference_hash: null | string;
  starts_at: null | string;
  title: null | string;
  token: string;
  updated_at: null | string;
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
  avg_block_time: null | string;
  change_24: null | string;
  circulating_supply: null | string;
  gas_price: null | string;
  high_24h: null | string;
  high_all: null | string;
  id: number;
  low_24h: null | string;
  low_all: null | string;
  market_cap: null | string;
  near_btc_price: null | string;
  near_price: null | string;
  nodes_online: null | number;
  total_supply: null | string;
  total_txns: null | string;
  volume: null | string;
};

export type TPS = {
  date: string;
  shards: JsonValue;
  txns: number;
};

export type Transaction = {
  block_timestamp: string;
  converted_into_receipt_id: string;
  included_in_block_hash: string;
  included_in_chunk_hash: string;
  index_in_chunk: number;
  receipt_conversion_gas_burnt: number;
  receipt_conversion_tokens_burnt: string;
  receiver_account_id: string;
  signer_account_id: string;
  status: ExecutionOutcomeStatus;
  transaction_hash: string;
};

export type ValidatorData = {
  current_validators: JsonObject;
  epoch_start_block: JsonObject;
  epoch_stats_check: JsonObject;
  genesis_config: JsonObject;
  latest_block: JsonObject;
  mapped_validators: JsonObject;
  pool_ids: JsonObject;
  protocol_config: JsonObject;
  stake_proposals: JsonObject;
  staking_pool_infos: JsonObject;
  staking_pool_metadata: JsonObject;
  validator_lists: JsonObject;
  validator_telemetry: JsonObject;
  validators_promise: JsonObject;
};

export type Campaign = {
  api_subscription_id: number;
  desktop_image_center: null | string;
  desktop_image_right: null | string;
  icon: null | string;
  id: number;
  is_active: boolean;
  is_approved: boolean;
  link_name: null | string;
  mobile_image: null | string;
  site_name: null | string;
  text: null | string;
  title: string;
  url: null | string;
};
