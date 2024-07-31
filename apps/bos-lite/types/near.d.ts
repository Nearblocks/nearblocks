type U8 = number;
type U32 = number;
type U64 = number;
type U128 = string;
type Bool = boolean;
type Isize = U32 | U64;
type Usize = U32 | U64;
type Option<T> = null | T;

type ProtocolVersion = U32;

type Utc = unknown;

type DateTime<T extends unknown = unknown> = string & T;

type BlockHeight = U64;

type NumSeats = U64;

type Vec<T> = T[];

type Ratio<T> = [T, T];

type Rational = Ratio<Isize>;

type EpochHeight = U64;

type BlockHeightDelta = U64;

type Gas = U64;

type Balance = U128;

type NumBlocks = U64;

type AccountId = string;

type NumShards = U64;

type ShardVersion = U32;

type ShardId = U64;

type ShardSplitMap = Vec<Vec<ShardId>>;

type StateRoot = CryptoHash;

type CryptoHash = string;

type Signature = string;

type StorageUsage = U64;

type Nonce = U64;

type MerkleHash = CryptoHash;

type Direction = 'Left' | 'Right';

type MerklePathItem = {
  direction: Direction;
  hash: MerkleHash;
};

type MerklePath = Vec<MerklePathItem>;

type Version = {
  build: string;
  version: string;
};

type DataReceiptCreationConfig = {
  base_cost: Fee;
  cost_per_byte: Fee;
};

type SlashedValidator = {
  account_id: AccountId;
  is_double_sign: Bool;
};

type ChallengesResult = Vec<SlashedValidator>;

type ActionCreationConfig = {
  add_key_cost: AccessKeyCreationConfig;
  create_account_cost: Fee;
  delete_account_cost: Fee;
  delete_key_cost: Fee;
  deploy_contract_cost: Fee;
  deploy_contract_cost_per_byte: Fee;
  function_call_cost: Fee;
  function_call_cost_per_byte: Fee;
  stake_cost: Fee;
  transfer_cost: Fee;
};

type StorageUsageConfig = {
  num_bytes_account: U64;
  num_extra_bytes_record: U64;
};

type RuntimeFeesConfig = {
  action_creation_config: ActionCreationConfig;
  action_receipt_creation_config: Fee;
  burnt_gas_reward: Ratio<Isize>;
  data_receipt_creation_config: DataReceiptCreationConfig;
  pessimistic_gas_price_inflation_ratio: Ratio<Isize>;
  storage_usage_config: StorageUsageConfig;
};

type ExtCostsConfig = {
  base: U64;
  contract_compile_base: U64;
  contract_compile_bytes: U64;
  ecrecover_base: U64;
  keccak256_base: U64;
  keccak256_byte: U64;
  keccak512_base: U64;
  keccak512_byte: U64;
  log_base: U64;
  log_byte: U64;
  promise_and_base: U64;
  promise_and_per_promise: U64;
  promise_return: U64;
  read_memory_base: U64;
  read_memory_byte: U64;
  read_register_base: U64;
  read_register_byte: U64;
  ripemd160_base: U64;
  ripemd160_block: U64;
  sha256_base: U64;
  sha256_byte: U64;
  storage_has_key_base: U64;
  storage_has_key_byte: U64;
  storage_iter_create_from_byte: U64;
  storage_iter_create_prefix_base: U64;
  storage_iter_create_prefix_byte: U64;
  storage_iter_create_range_base: U64;
  storage_iter_create_to_byte: U64;
  storage_iter_next_base: U64;
  storage_iter_next_key_byte: U64;
  storage_iter_next_value_byte: U64;
  storage_read_base: U64;
  storage_read_key_byte: U64;
  storage_read_value_byte: U64;
  storage_remove_base: U64;
  storage_remove_key_byte: U64;
  storage_remove_ret_value_byte: U64;
  storage_write_base: U64;
  storage_write_evicted_byte: U64;
  storage_write_key_byte: U64;
  storage_write_value_byte: U64;
  touching_trie_node: U64;
  utf16_decoding_base: U64;
  utf16_decoding_byte: U64;
  utf8_decoding_base: U64;
  utf8_decoding_byte: U64;
  validator_stake_base: U64;
  validator_total_stake_base: U64;
  write_memory_base: U64;
  write_memory_byte: U64;
  write_register_base: U64;
  write_register_byte: U64;
};

type VMLimitConfig = {
  initial_memory_pages: U32;
  max_actions_per_receipt: U64;
  max_arguments_length: U64;
  max_contract_size: U64;
  max_gas_burnt: U64;
  max_gas_burnt_view: U64;
  max_length_method_name: U64;
  max_length_returned_data: U64;
  max_length_storage_key: U64;
  max_length_storage_value: U64;
  max_memory_pages: U32;
  max_number_bytes_method_names: U64;
  max_number_input_data_dependencies: U64;
  max_number_logs: U64;
  max_number_registers: U64;
  max_promises_per_function_call_action: U64;
  max_register_size: U64;
  max_stack_height: U32;
  max_total_log_length: U64;
  max_total_prepaid_gas: U64;
  max_transaction_size: U64;
  registers_memory_limit: U64;
};

type VMConfig = {
  ext_costs: ExtCostsConfig;
  grow_mem_cost: U32;
  limit_config: VMLimitConfig;
  regular_op_cost: U32;
};

type Fee = {
  execution: U64;
  send_not_sir: U64;
  send_sir: U64;
};

type AccessKeyCreationConfig = {
  full_access_cost: Fee;
  function_call_cost: Fee;
  function_call_cost_per_byte: Fee;
};

type AccountCreationConfig = {
  min_allowed_top_level_account_length: U8;
  registrar_account_id: AccountId;
};

type RuntimeConfig = {
  account_creation_config: AccountCreationConfig;
  storage_amount_per_byte: Balance;
  transaction_costs: RuntimeFeesConfig;
  wasm_config: VMConfig;
};

type ShardLayoutV0 = {
  num_shards: NumShards;
  version: ShardVersion;
};

type ShardLayoutV1 = {
  boundary_accounts: Vec<AccountId>;
  fixed_shards: Vec<AccountId>;
  shards_split_map: Option<ShardSplitMap>;
  to_parent_shard_map: Option<Vec<ShardId>>;
  version: ShardVersion;
};

type ShardLayout = { V0: ShardLayoutV0 } | { V1: ShardLayoutV1 };

type PublicKey = string;

type AccountInfo = {
  account_id: AccountId;
  amount: Balance;
  public_key: PublicKey;
};

type GenesisConfig = {
  avg_hidden_validator_seats_per_shard: Vec<NumSeats>;
  block_producer_kickout_threshold: U8;
  chain_id: string;
  chunk_producer_kickout_threshold: U8;
  dynamic_resharding: Bool;
  epoch_length: BlockHeightDelta;
  fishermen_threshold: Balance;
  gas_limit: Gas;
  gas_price_adjustment_rate: Rational;
  genesis_height: BlockHeight;
  genesis_time: DateTime<Utc>;
  max_gas_price: Balance;
  max_inflation_rate: Rational;
  min_gas_price: Balance;
  minimum_stake_divisor: U64;
  minimum_stake_ratio: Rational;
  num_block_producer_seats: NumSeats;
  num_block_producer_seats_per_shard: Vec<NumSeats>;
  num_blocks_per_year: NumBlocks;
  online_max_threshold: Rational;
  online_min_threshold: Rational;
  protocol_reward_rate: Rational;
  protocol_treasury_account: AccountId;
  protocol_upgrade_num_epochs: EpochHeight;
  protocol_upgrade_stake_threshold: Rational;
  protocol_version: ProtocolVersion;
  shard_layout: ShardLayout;
  simple_nightshade_shard_layout: Option<ShardLayout>;
  total_supply: Balance;
  transaction_validity_period: NumBlocks;
  validators: Vec<AccountInfo>;
};

type ProtocolConfigView = {
  avg_hidden_validator_seats_per_shard: Vec<NumSeats>;
  block_producer_kickout_threshold: U8;
  chain_id: string;
  chunk_producer_kickout_threshold: U8;
  dynamic_resharding: Bool;
  epoch_length: BlockHeightDelta;
  fishermen_threshold: Balance;
  gas_limit: Gas;
  gas_price_adjustment_rate: Rational;
  genesis_height: BlockHeight;
  genesis_time: DateTime<Utc>;
  max_gas_price: Balance;
  max_inflation_rate: Rational;
  min_gas_price: Balance;
  minimum_stake_divisor: U64;
  num_block_producer_seats: NumSeats;
  num_block_producer_seats_per_shard: Vec<NumSeats>;
  num_blocks_per_year: NumBlocks;
  online_max_threshold: Rational;
  online_min_threshold: Rational;
  protocol_reward_rate: Rational;
  protocol_treasury_account: AccountId;
  protocol_upgrade_stake_threshold: Rational;
  protocol_version: ProtocolVersion;
  runtime_config: RuntimeConfig;
  transaction_validity_period: NumBlocks;
};

type ChunkHeaderView = {
  balance_burnt: Balance;
  chunk_hash: CryptoHash;
  encoded_length: U64;
  encoded_merkle_root: CryptoHash;
  gas_limit: Gas;
  gas_used: Gas;
  height_created: BlockHeight;
  height_included: BlockHeight;
  outcome_root: CryptoHash;
  outgoing_receipts_root: CryptoHash;
  prev_block_hash: CryptoHash;
  prev_state_root: StateRoot;
  rent_paid: Balance;
  shard_id: ShardId;
  signature: Signature;
  tx_root: CryptoHash;
  validator_proposals: Vec<ValidatorStakeView>;
  validator_reward: Balance;
};

type BlockHeaderView = {
  approvals: Vec<Option<Signature>>;
  block_merkle_root: CryptoHash;
  challenges_result: ChallengesResult;
  challenges_root: CryptoHash;
  chunk_headers_root: CryptoHash;
  chunk_mask: Vec<Bool>;
  chunk_receipts_root: CryptoHash;
  chunk_tx_root: CryptoHash;
  chunks_included: U64;
  epoch_id: CryptoHash;
  gas_price: Balance;
  hash: CryptoHash;
  height: BlockHeight;
  last_ds_final_block: CryptoHash;
  last_final_block: CryptoHash;
  latest_protocol_version: ProtocolVersion;
  next_bp_hash: CryptoHash;
  next_epoch_id: CryptoHash;
  outcome_root: CryptoHash;
  prev_hash: CryptoHash;
  prev_state_root: CryptoHash;
  random_value: CryptoHash;
  rent_paid: Balance;
  signature: Signature;
  timestamp: U64;
  timestamp_nanosec: string;
  total_supply: Balance;
  validator_proposals: Vec<ValidatorStakeView>;
  validator_reward: Balance;
};

type BlockView = {
  author: AccountId;
  chunks: Vec<ChunkHeaderView>;
  header: BlockHeaderView;
};

type ValidatorStakeViewV1 = {
  account_id: AccountId;
  public_key: PublicKey;
  stake: Balance;
};

type ValidatorStakeView = ValidatorStakeViewV1;

type CurrentEpochValidatorInfo = {
  account_id: AccountId;
  is_slashed: Bool;
  num_expected_blocks: NumBlocks;
  num_expected_chunks: NumBlocks;
  num_produced_blocks: NumBlocks;
  num_produced_chunks: NumBlocks;
  public_key: PublicKey;
  shards: Vec<ShardId>;
  stake: Balance;
};

type NextEpochValidatorInfo = {
  account_id: AccountId;
  public_key: PublicKey;
  shards: Vec<ShardId>;
  stake: Balance;
};

type ValidatorKickoutReason =
  | 'Slashed'
  | {
      NotEnoughBlocks: {
        expected: NumBlocks;
        produced: NumBlocks;
      };
    }
  | {
      NotEnoughChunks: {
        expected: NumBlocks;
        produced: NumBlocks;
      };
    }
  | {
      NotEnoughStake: {
        stake: Balance;
        threshold: Balance;
      };
    }
  | { DidNotGetASeat: {} }
  | { Unstaked: {} };

type ValidatorKickoutView = {
  account_id: AccountId;
  reason: ValidatorKickoutReason;
};

type EpochValidatorInfo = {
  current_fishermen: Vec<ValidatorStakeView>;
  current_proposals: Vec<ValidatorStakeView>;
  current_validators: Vec<CurrentEpochValidatorInfo>;
  epoch_height: EpochHeight;
  epoch_start_height: BlockHeight;
  next_fishermen: Vec<ValidatorStakeView>;
  next_validators: Vec<NextEpochValidatorInfo>;
  prev_epoch_kickout: Vec<ValidatorKickoutView>;
};

type QueryResponseKind = {
  AccessKey: AccessKeyView;
  AccessKeyList: AccessKeyList;
  CallResult: CallResult;
  ViewAccount: AccountView;
  ViewCode: ContractCodeView;
  ViewState: ViewStateResult;
};

type RpcQueryResponse = QueryResponseKind[keyof QueryResponseKind] & {
  block_hash: CryptoHash;
  block_height: BlockHeight;
};

type RpcQueryRequestTypeMapping = {
  call_function: CallResult;
  view_access_key: AccessKeyView;
  view_access_key_list: AccessKeyList;
  view_account: AccountView;
  view_code: ContractCodeView;
  view_state: ViewStateResult;
};

type RpcQueryResponseNarrowed<K extends keyof RpcQueryRequestTypeMapping> =
  Omit<RpcQueryResponse, keyof QueryResponseKind[keyof QueryResponseKind]> &
    RpcQueryRequestTypeMapping[K];

type ContractCodeView = {
  code: Vec<U8>;
  hash: CryptoHash;
};

type TrieProofPath = string[];

type StateItem = {
  key: string;
  proof: TrieProofPath;
  value: string;
};

type ViewStateResult = {
  proof: TrieProofPath;
  values: Vec<StateItem>;
};

type CallResult = {
  logs: string[];
  result: Vec<U8>;
};

type AccountView = {
  amount: Balance;
  code_hash: CryptoHash;
  locked: Balance;
  storage_paid_at: BlockHeight;
  storage_usage: StorageUsage;
};

type AccessKeyPermissionView =
  | 'FullAccess'
  | {
      FunctionCall: {
        allowance: Option<Balance>;
        method_names: string[];
        receiver_id: string;
      };
    };

type AccessKeyView = {
  nonce: Nonce;
  permission: AccessKeyPermissionView;
};

type AccessKeyInfoView = {
  access_key: AccessKeyView;
  public_key: PublicKey;
};

type AccessKeyList = {
  keys: Vec<AccessKeyInfoView>;
};

type ValidatorInfo = {
  account_id: AccountId;
  is_slashed: Bool;
};

type StatusSyncInfo = {
  earliest_block_hash: Option<CryptoHash>;
  earliest_block_height: Option<BlockHeight>;
  earliest_block_time: Option<DateTime<Utc>>;
  latest_block_hash: CryptoHash;
  latest_block_height: BlockHeight;
  latest_block_time: DateTime<Utc>;
  latest_state_root: CryptoHash;
  syncing: Bool;
};

type StatusResponse = {
  chain_id: string;
  latest_protocol_version: U32;
  protocol_version: U32;
  rpc_addr: null | string;
  sync_info: StatusSyncInfo;
  validator_account_id: Option<AccountId>;
  validators: Vec<ValidatorInfo>;
  version: Version;
};

type FinalExecutionStatus =
  | { Failure: unknown }
  | { NotStarted: unknown }
  | { Started: unknown }
  | { SuccessValue: string };

type SignedTransactionView = {
  actions: Vec<ActionView>;
  hash: CryptoHash;
  nonce: Nonce;
  public_key: PublicKey;
  receiver_id: AccountId;
  signature: Signature;
  signer_id: AccountId;
};

type CompilationError =
  | { CodeDoesNotExist: { account_id: AccountId } }
  | { PrepareError: unknown }
  | { UnsupportedCompiler: { msg: string } }
  | { WasmerCompileError: { msg: string } };
type FunctionCallError =
  | { _EVMError: unknown }
  | { CompilationError: CompilationError }
  | { ExecutionError: string }
  | { HostError: unknown }
  | { LinkError: { msg: string } }
  | { MethodResolveError: unknown }
  | { WasmTrap: unknown }
  | { WasmUnknownError: unknown };

type ActionsValidation = unknown;
type NewReceiptValidationError =
  | {
      NumberInputDataDependenciesExceeded: {
        limit: U64;
        number_of_input_data_dependencies: U64;
      };
    }
  | { ActionsValidation: ActionsValidation }
  | { InvalidDataReceiverId: { account_id: string } }
  | { InvalidPredecessorId: { account_id: string } }
  | { InvalidReceiverId: { account_id: string } }
  | { InvalidSignerId: { account_id: string } }
  | { ReturnedValueLengthExceeded: { length: U64; limit: U64 } };

type InvalidAccessKeyError =
  | 'DepositWithFunctionCall'
  | 'RequiresFullAccess'
  | {
      AccessKeyNotFound: {
        account_id: AccountId;
        public_key: PublicKey;
      };
    }
  | {
      MethodNameMismatch: {
        method_name: string;
      };
    }
  | {
      NotEnoughAllowance: {
        account_id: AccountId;
        allowance: Balance;
        cost: Balance;
        public_key: PublicKey;
      };
    }
  | {
      ReceiverMismatch: {
        ak_receiver: string;
        tx_receiver: AccountId;
      };
    };

type ActionErrorKind =
  | 'DelegateActionExpired'
  | 'DelegateActionInvalidSignature'
  | {
      CreateAccountNotAllowed: {
        account_id: AccountId;
        predecessor_id: AccountId;
      };
    }
  | {
      CreateAccountOnlyByRegistrar: {
        account_id: AccountId;
        predecessor_id: AccountId;
        registrar_account_id: AccountId;
      };
    }
  | {
      DelegateActionNonceTooLarge: {
        delegate_nonce: Nonce;
        upper_bound: Nonce;
      };
    }
  | {
      DelegateActionSenderDoesNotMatchTxReceiver: {
        receiver_id: AccountId;
        sender_id: AccountId;
      };
    }
  | {
      InsufficientStake: {
        account_id: AccountId;
        minimum_stake: Balance;
        stake: Balance;
      };
    }
  | {
      TriesToStake: {
        account_id: AccountId;
        balance: Balance;
        locked: Balance;
        stake: Balance;
      };
    }
  | { AccountAlreadyExists: { account_id: AccountId } }
  | { AccountDoesNotExist: { account_id: AccountId } }
  | { ActorNoPermission: { account_id: AccountId; actor_id: AccountId } }
  | { AddKeyAlreadyExists: { account_id: AccountId; public_key: PublicKey } }
  | { DelegateActionAccessKeyError: InvalidAccessKeyError }
  | { DelegateActionInvalidNonce: { ak_nonce: Nonce; delegate_nonce: Nonce } }
  | { DeleteAccountStaking: { account_id: AccountId } }
  | { DeleteAccountWithLargeState: { account_id: AccountId } }
  | { DeleteKeyDoesNotExist: { account_id: AccountId; public_key: PublicKey } }
  | { FunctionCallError: FunctionCallError }
  | { LackBalanceForState: { account_id: AccountId; amount: Balance } }
  | { NewReceiptValidationError: NewReceiptValidationError }
  | { OnlyImplicitAccountCreationAllowed: { account_id: AccountId } }
  | { TriesToUnstake: { account_id: AccountId } };

type ActionError = {
  index: U64;
  kind: ActionErrorKind;
};

type InvalidTxError =
  | {
      NotEnoughBalance: {
        balance: Balance;
        cost: Balance;
        signer_id: AccountId;
      };
    }
  | { ActionsValidation: unknown }
  | { CostOverflow: unknown }
  | { Expired: unknown }
  | { InvalidAccessKeyError: InvalidAccessKeyError }
  | { InvalidChain: unknown }
  | { InvalidNonce: { ak_nonce: Nonce; tx_nonce: Nonce } }
  | { InvalidReceiverId: { receiver_id: string } }
  | { InvalidSignature: unknown }
  | { InvalidSignerId: { signer_id: string } }
  | { LackBalanceForState: { amount: Balance; signer_id: AccountId } }
  | { NonceTooLarge: { tx_nonce: Nonce; upper_bound: Nonce } }
  | { SignerDoesNotExist: { signer_id: AccountId } }
  | { TransactionSizeExceeded: { limit: U64; size: U64 } };

type TxExecutionError =
  | { ActionError: ActionError }
  | { InvalidTxError: InvalidTxError };

type ExecutionStatusView =
  | { Failure: TxExecutionError }
  | { SuccessReceiptId: CryptoHash }
  | { SuccessValue: string }
  | { Unknown: unknown };

type CostGasUsed = {
  cost: string;
  cost_category: string;
  gas_used: Gas;
};

type ExecutionMetadataView = {
  gas_profile: Option<Vec<CostGasUsed>>;
  version: U32;
};

type ExecutionOutcomeView = {
  executor_id: AccountId;
  gas_burnt: Gas;
  logs: string[];
  metadata: ExecutionMetadataView;
  receipt_ids: Vec<CryptoHash>;
  status: ExecutionStatusView;
  tokens_burnt: Balance;
};

type ExecutionOutcomeWithIdView = {
  block_hash: CryptoHash;
  id: CryptoHash;
  outcome: ExecutionOutcomeView;
  proof: MerklePath;
};

type FinalExecutionOutcomeView = {
  receipts_outcome: Vec<ExecutionOutcomeWithIdView>;
  status: FinalExecutionStatus;
  transaction: SignedTransactionView;
  transaction_outcome: ExecutionOutcomeWithIdView;
};

type NonDelegateActionView = Exclude<ActionView, DelegateActionView>;

type DelegateAction = {
  actions: Vec<NonDelegateActionView>;
  max_block_height: BlockHeight;
  nonce: Nonce;
  public_key: PublicKey;
  receiver_id: AccountId;
  sender_id: AccountId;
};

type DeployContractActionView = {
  DeployContract: {
    code: string;
  };
};
type FunctionCallActionView = {
  FunctionCall: {
    args: string;
    deposit: Balance;
    gas: Gas;
    method_name: string;
  };
};
type TransferActionView = {
  Transfer: {
    deposit: Balance;
  };
};
type StakeActionView = {
  Stake: {
    public_key: PublicKey;
    stake: Balance;
  };
};
type AddKeyActionView = {
  AddKey: {
    access_key: AccessKeyView;
    public_key: PublicKey;
  };
};
type DeleteKeyActionView = {
  DeleteKey: {
    public_key: PublicKey;
  };
};
type DeleteAccountActionView = {
  DeleteAccount: {
    beneficiary_id: AccountId;
  };
};
type DelegateActionView = {
  Delegate: {
    delegate_action: DelegateAction;
    signature: Signature;
  };
};
type ActionView =
  | 'CreateAccount'
  | AddKeyActionView
  | DelegateActionView
  | DeleteAccountActionView
  | DeleteKeyActionView
  | DeployContractActionView
  | FunctionCallActionView
  | StakeActionView
  | TransferActionView;

type DataReceiverView = {
  data_id: CryptoHash;
  receiver_id: AccountId;
};

type ReceiptEnumView =
  | {
      Action: {
        actions: Vec<ActionView>;
        gas_price: Balance;
        input_data_ids: Vec<CryptoHash>;
        output_data_receivers: Vec<DataReceiverView>;
        signer_id: AccountId;
        signer_public_key: PublicKey;
      };
    }
  | {
      Data: {
        data: Option<Vec<U8>>;
        data_id: CryptoHash;
      };
    };

type ReceiptView = {
  predecessor_id: AccountId;
  receipt: ReceiptEnumView;
  receipt_id: CryptoHash;
  receiver_id: AccountId;
};

type FinalExecutionOutcomeWithReceiptView = FinalExecutionOutcomeView & {
  receipts: Vec<ReceiptView>;
};

type PeerId = PublicKey;

type SocketAddr = string;

type RpcPeerInfo = {
  account_id: Option<AccountId>;
  addr: Option<SocketAddr>;
  id: PeerId;
};

type RpcKnownProducer = {
  account_id: AccountId;
  addr: Option<SocketAddr>;
  peer_id: PeerId;
};

type RpcNetworkInfoResponse = {
  active_peers: Vec<RpcPeerInfo>;
  known_producers: Vec<RpcKnownProducer>;
  num_active_peers: Usize;
  peer_max_count: U32;
  received_bytes_per_sec: U64;
  sent_bytes_per_sec: U64;
};

type ResponseMapping = {
  block: BlockView;
  broadcast_tx_async: unknown;
  broadcast_tx_commit: unknown;
  chunk: unknown;
  EXPERIMENTAL_broadcast_tx_sync: unknown;
  EXPERIMENTAL_changes: unknown;
  EXPERIMENTAL_changes_in_block: unknown;
  EXPERIMENTAL_check_tx: unknown;
  EXPERIMENTAL_genesis_config: GenesisConfig;
  EXPERIMENTAL_protocol_config: ProtocolConfigView;
  EXPERIMENTAL_receipt: unknown;
  EXPERIMENTAL_tx_status: FinalExecutionOutcomeWithReceiptView;
  EXPERIMENTAL_validators_ordered: unknown;
  gas_price: unknown;
  health: unknown;
  light_client_proof: unknown;
  network_info: RpcNetworkInfoResponse;
  next_light_client_block: unknown;
  query: RpcQueryResponse;
  status: StatusResponse;
  tx: unknown;
  validators: EpochValidatorInfo;
};

type ActionNonDelegateAction =
  | {
      args: {
        accessKey: {
          nonce: number;
          permission:
            | {
                contractId: string;
                methodNames: string[];
                type: 'functionCall';
              }
            | {
                type: 'fullAccess';
              };
        };
        publicKey: string;
      };
      kind: 'addKey';
    }
  | {
      args: {
        args: string;
        deposit: string;
        gas: number;
        methodName: string;
      };
      kind: 'functionCall';
    }
  | {
      args: {
        beneficiaryId: string;
      };
      kind: 'deleteAccount';
    }
  | {
      args: {
        code: string;
      };
      kind: 'deployContract';
    }
  | {
      args: {
        deposit: string;
      };
      kind: 'transfer';
    }
  | {
      args: {
        publicKey: string;
        stake: string;
      };
      kind: 'stake';
    }
  | {
      args: {
        publicKey: string;
      };
      kind: 'deleteKey';
    }
  | {
      args: {};
      kind: 'createAccount';
    };

type ActionDelegateAction = {
  args: {
    actions: (ActionNonDelegateAction & { delegateIndex: number })[];
    receiverId: string;
    senderId: string;
  };
  kind: 'delegateAction';
};

type Action = ActionDelegateAction | ActionNonDelegateAction;

type ParsedReceiptOld = Omit<NestedReceiptWithOutcomeOld, 'outcome'> & {
  outcome: Omit<NestedReceiptWithOutcomeOld['outcome'], 'nestedReceipts'> & {
    receiptIds: string[];
  };
};

type FailedToFindReceipt = { id: string };

type NestedReceiptWithOutcomeOld = {
  actions: Action[];
  id: string;
  outcome: {
    blockHash: string;
    gasBurnt: number;
    logs: string[];
    nestedReceipts: (FailedToFindReceipt | NestedReceiptWithOutcomeOld)[];
    status: RpcReceiptExecutionStatus;
    tokensBurnt: string;
  };
  predecessorId: string;
  receiverId: string;
};

type NestedReceiptWithOutcome = Omit<NestedReceiptWithOutcomeOld, 'outcome'> & {
  outcome: Omit<
    NestedReceiptWithOutcomeOld['outcome'],
    'blockHash' | 'nestedReceipts'
  > & {
    block: {
      hash: string;
      height: number;
      timestamp: number;
    };
    nestedReceipts: (FailedToFindReceipt | NestedReceiptWithOutcome)[];
  };
};

type ParsedReceipt = Omit<NestedReceiptWithOutcome, 'outcome'> & {
  outcome: Omit<NestedReceiptWithOutcome['outcome'], 'nestedReceipts'> & {
    receiptIds: string[];
  };
};

type ParsedBlock = {
  hash: string;
  height: number;
  timestamp: number;
};

type RpcUnknownError = { type: 'unknown' };

type RpcFunctionCallError =
  | {
      error: RpcCompilationError;
      type: 'compilationError';
    }
  | { error: string; type: 'executionError' }
  | { msg: string; type: 'linkError' }
  | { type: 'evmError' }
  | { type: 'hostError' }
  | { type: 'methodResolveError' }
  | { type: 'wasmTrap' }
  | { type: 'wasmUnknownError' }
  | RpcUnknownError;

type RpcNewReceiptValidationError =
  | {
      limit: number;
      numberOfInputDataDependencies: number;
      type: 'numberInputDataDependenciesExceeded';
    }
  | { accountId: String; type: 'invalidDataReceiverId' }
  | { accountId: String; type: 'invalidPredecessorId' }
  | { accountId: String; type: 'invalidReceiverId' }
  | { accountId: String; type: 'invalidSignerId' }
  | { length: number; limit: number; type: 'returnedValueLengthExceeded' }
  | { type: 'actionsValidation' }
  | RpcUnknownError;

type RpcCompilationError =
  | { accountId: string; type: 'codeDoesNotExist' }
  | { msg: string; type: 'unsupportedCompiler' }
  | { msg: string; type: 'wasmerCompileError' }
  | { type: 'prepareError' }
  | RpcUnknownError;

type RpcReceiptActionError =
  | {
      accountId: string;
      actorId: string;
      type: 'actorNoPermission';
    }
  | {
      accountId: string;
      amount: string;
      type: 'lackBalanceForState';
    }
  | {
      accountId: string;
      balance: string;
      locked: string;
      stake: string;
      type: 'triesToStake';
    }
  | {
      accountId: string;
      minimumStake: string;
      stake: string;
      type: 'insufficientStake';
    }
  | {
      accountId: string;
      predecessorId: string;
      registrarAccountId: string;
      type: 'createAccountOnlyByRegistrar';
    }
  | {
      accountId: string;
      predecessorId: string;
      type: 'createAccountNotAllowed';
    }
  | {
      accountId: string;
      publicKey: string;
      type: 'addKeyAlreadyExists';
    }
  | {
      accountId: string;
      publicKey: string;
      type: 'deleteKeyDoesNotExist';
    }
  | {
      accountId: string;
      type: 'accountAlreadyExists';
    }
  | {
      accountId: string;
      type: 'accountDoesNotExist';
    }
  | {
      accountId: string;
      type: 'deleteAccountStaking';
    }
  | {
      accountId: string;
      type: 'triesToUnstake';
    }
  | {
      akNonce: number;
      delegateNonce: number;
      type: 'delegateActionInvalidNonce';
    }
  | {
      delegateNonce: number;
      type: 'delegateActionNonceTooLarge';
      upperBound: number;
    }
  | {
      error: RpcFunctionCallError;
      type: 'functionCallError';
    }
  | {
      error: RpcNewReceiptValidationError;
      type: 'newReceiptValidationError';
    }
  | {
      receiverId: string;
      senderId: string;
      type: 'delegateActionSenderDoesNotMatchTxReceiver';
    }
  | { accountId: string; type: 'deleteAccountWithLargeState' }
  | { accountId: string; type: 'onlyImplicitAccountCreationAllowed' }
  | { error: RpcInvalidAccessKeyError; type: 'delegateActionAccessKeyError' }
  | { type: 'delegateActionExpired' }
  | { type: 'delegateActionInvalidSignature' }
  | RpcUnknownError;

type RpcInvalidAccessKeyError =
  | {
      accountId: string;
      allowance: string;
      cost: string;
      publicKey: string;
      type: 'notEnoughAllowance';
    }
  | {
      akReceiver: string;
      transactionReceiver: string;
      type: 'receiverMismatch';
    }
  | { accountId: string; publicKey: string; type: 'accessKeyNotFound' }
  | { methodName: string; type: 'methodNameMismatch' }
  | { type: 'depositWithFunctionCall' }
  | { type: 'requiresFullAccess' }
  | RpcUnknownError;

type RpcReceiptTransactionError =
  | {
      balance: string;
      cost: string;
      signerId: string;
      type: 'notEnoughBalance';
    }
  | { akNonce: number; transactionNonce: number; type: 'invalidNonce' }
  | { amount: string; signerId: string; type: 'lackBalanceForState' }
  | { error: RpcInvalidAccessKeyError; type: 'invalidAccessKeyError' }
  | { limit: number; size: number; type: 'transactionSizeExceeded' }
  | { receiverId: string; type: 'invalidReceiverId' }
  | { signerId: string; type: 'invalidSignerId' }
  | { signerId: string; type: 'signerDoesNotExist' }
  | { transactionNonce: number; type: 'nonceTooLarge'; upperBound: number }
  | { type: 'actionsValidation' }
  | { type: 'costOverflow' }
  | { type: 'expired' }
  | { type: 'invalidChain' }
  | { type: 'invalidSignature' }
  | RpcUnknownError;

type RpcReceiptExecutionStatusError =
  | {
      error: RpcReceiptActionError;
      type: 'action';
    }
  | {
      error: RpcReceiptTransactionError;
      type: 'transaction';
    }
  | RpcUnknownError;

type RpcReceiptExecutionStatus =
  | {
      error: RpcReceiptExecutionStatusError;
      type: 'failure';
    }
  | {
      receiptId: string;
      type: 'successReceiptId';
    }
  | {
      type: 'successValue';
      value: string;
    }
  | {
      type: 'unknown';
    };
