export type IconProps = {
  className?: string;
};

export type StatsResponse = {
  stats: Stats[];
};

export type Stats = {
  avg_block_time: string;
  change_24: string;
  circulating_supply: string;
  gas_price: string;
  high_24h: string;
  high_all: string;
  id: number;
  low_24h: string;
  low_all: string;
  market_cap: string;
  near_btc_price: string;
  near_price: string;
  nodes_online: number;
  total_supply: string;
  total_txns: string;
  tps: number;
  volume: string;
};

export type ChartsResponse = {
  charts: Charts[];
};

export type Charts = {
  date: string;
  near_price: string;
  txns: string;
};

export type ChartSeries = {
  date: string;
  price: string;
  txns: string;
  y: number;
};

export type Keys = {
  access: string;
  allowance: string;
  contract: string;
  methods: string;
  publicKey: string;
};

export type PriceResponse = {
  stats: Price[];
};

export type Price = {
  near_price: string;
};

export type TxExecutionStatus =
  | 'NONE'
  | 'INCLUDED'
  | 'INCLUDED_FINAL'
  | 'EXECUTED'
  | 'FINAL'
  | 'EXECUTED_OPTIMISTIC';

export enum ExecutionStatusBasic {
  Unknown = 'Unknown',
  Pending = 'Pending',
  Failure = 'Failure',
}

export enum FinalExecutionStatusBasic {
  NotStarted = 'NotStarted',
  Started = 'Started',
  Failure = 'Failure',
}

export interface ExecutionStatus {
  SuccessValue?: string;
  SuccessReceiptId?: string;
  Failure?: ExecutionError;
}

export interface ExecutionError {
  error_message: string;
  error_type: string;
}

export type ReceiptAction = { Transfer: { deposit: string } };

export interface ExecutionOutcome {
  logs: string[];
  receipt_ids: string[];
  gas_burnt: number;
  tokens_burnt: string;
  executor_id: string;
  status: ExecutionStatus | ExecutionStatusBasic;
}

export interface ExecutionOutcomeWithId {
  id: string;
  outcome: ExecutionOutcome;
}

export interface ExecutionOutcomeReceiptAction {
  actions: ReceiptAction[];
  gas_price: string;
  input_data_ids: string[];
  output_data_receivers: string[];
  signer_id: string;
  signer_public_key: string;
}

export interface ExecutionOutcomeReceiptDetail {
  predecessor_id: string;
  receipt: {
    Action: ExecutionOutcomeReceiptAction;
  };
  receipt_id: string;
  receiver_id: string;
}

export interface ExecutionOutcomeWithIdView {
  proof: MerklePath;
  block_hash: string;
  id: string;
  outcome: ExecutionOutcome;
}

export interface FinalExecutionOutcome {
  final_execution_status: TxExecutionStatus;
  status: FinalExecutionStatus | FinalExecutionStatusBasic;
  transaction: any;
  transaction_outcome: ExecutionOutcomeWithId;
  receipts_outcome: ExecutionOutcomeWithId[];
  receipts?: ExecutionOutcomeReceiptDetail[];
}

export interface Transaction {
  actions: Array<any>;
  hash: string;
  nonce: bigint;
  public_key: string;
  receiver_id: string;
  signature: string;
  signer_id: string;
}

export interface RpcResultTxn extends FinalExecutionOutcome {
  receipts_outcome: ExecutionOutcomeWithIdView[];
  transaction: Transaction;
  transaction_outcome: ExecutionOutcomeWithIdView;
}

export interface BlockHeader {
  height: number;
  epoch_id: string;
  next_epoch_id: string;
  hash: string;
  prev_hash: string;
  prev_state_root: string;
  chunk_receipts_root: string;
  chunk_headers_root: string;
  chunk_tx_root: string;
  outcome_root: string;
  chunks_included: number;
  challenges_root: string;
  timestamp: number;
  timestamp_nanosec: string;
  random_value: string;
  validator_proposals: any[];
  chunk_mask: boolean[];
  gas_price: string;
  rent_paid: string;
  validator_reward: string;
  total_supply: string;
  challenges_result: any[];
  last_final_block: string;
  last_ds_final_block: string;
  next_bp_hash: string;
  block_merkle_root: string;
  approvals: string[];
  signature: string;
  latest_protocol_version: number;
}

export interface Chunk {
  chunk_hash: string;
  prev_block_hash: string;
  outcome_root: string;
  prev_state_root: string;
  encoded_merkle_root: string;
  encoded_length: number;
  height_created: number;
  height_included: number;
  shard_id: number;
  gas_used: number;
  gas_limit: number;
  rent_paid: string;
  validator_reward: string;
  balance_burnt: string;
  outgoing_receipts_root: string;
  tx_root: string;
  validator_proposals: any[];
  signature: string;
}

export interface BlockResult {
  author: string;
  header: BlockHeader;
  chunks: Chunk[];
}

export interface RpcResultBlock extends BlockResult {}
