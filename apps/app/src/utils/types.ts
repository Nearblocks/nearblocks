import type { NextPage } from 'next';
import type { ReactElement, ReactNode } from 'react';
import { ValidatorEpochData, ValidatorTelemetry } from 'nb-types';

export type NextPageWithLayout<T = any> = NextPage<T> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

export type NetworkId = ProductionNetwork['networkId'];
export type Network = ProductionNetwork;

type ProductionNetwork = {
  networkId: 'testnet' | 'mainnet';
};

export type SatsInfo = {
  near_price: string;
};

export type AccountTimestampInfo = {
  block_timestamp: string;
  transaction_hash: string;
};

export type AccountInfo = {
  account_id: string;
  amount: string;
  code_hash: string;
  created: AccountTimestampInfo;
  deleted: AccountTimestampInfo;
  locked: string;
  storage_usage: string;
};

export type DeploymentsInfo = {
  block_timestamp: string;
  receipt_predecessor_account_id: string;
  transaction_hash: string;
};

export type TokenInfo = {
  name: string;
  icon: string;
  symbol: string;
  price: string;
  website: string;
};

export type Stats = {
  block: string;
  gas_price: string;
  avg_block_time: string;
  nodes: string;
  nodes_online: string;
  near_price: string;
  near_btc_price: string;
  market_cap: string;
  volume: string;
  high_24h: string;
  high_all: string;
  low_24h: string;
  low_all: string;
  change_24: string;
  total_supply: string;
  total_txns: string;
};

export type MetaInfo = {
  decimals: string;
  icon: string;
  name: string;
  price: string;
  reference: string;
  symbol: string;
  contract: string;
};

export type FtsInfo = {
  affected_account_id: string;
  block_timestamp: string;
  delta_amount: string;
  ft_meta: MetaInfo;
  event_index: string;
  involved_account_id: string;
  contract: string;
  cause: string;
};

export type NftsInfo = {
  affected_account_id: string;
  block_timestamp: string;
  delta_amount: string;
  nft_meta: MetaInfo;
  quantity: string;
  nft_token_meta: string;
  event_index: string;
  involved_account_id: string;
  contract: string;
  cause: string;
};

export type InventoryInfo = {
  fts: FtsInfo[];
  nfts: NftsInfo[];
};

export type BlocksInfo = {
  author_account_id: string;
  block_hash: string;
  block_height: string;
  block_timestamp: string;
  chunks_agg: {
    gas_limit: string;
    gas_used: string;
    shards: string;
  };
  gas_price: string;
  prev_block_hash: string;
  receipts_agg: {
    count: string;
  };
  transactions_agg: {
    count: string;
  };
};

export type ContractCodeInfo = {
  block_hash: string;
  block_height: string;
  code_base64: string;
  hash: string;
};

export type KeysInfo = {
  access_key: {
    nonce: string;
    permission: string;
  };
  public_key: string;
};

export type AccessKeyInfo = {
  block_hash: string;
  block_height: string;
  keys: KeysInfo[];
  hash: string;
};

export type ContractInfo = {
  locked?: boolean;
  hash: string;
};

export type TokenListInfo = {
  amount: string;
  contract: string;
  ft_meta: MetaInfo;
  rpcAmount: string;
  amountUsd: string;
};

export type FtInfo = {
  amount: string;
  tokens: TokenListInfo[];
};

export type StatusInfo = {
  avg_block_time: string;
  block: string;
  change_24: string;
  gas_price: string;
  high_24h: string;
  high_all: string;
  low_24h: string;
  low_all: string;
  market_cap: string;
  near_btc_price: string;
  near_price: string;
  nodes: string;
  nodes_online: string;
  total_supply: string;
  total_txns: string;
  volume: string;
  tps: string;
};

export type ChartSeriesInfo = {
  type: string;
  data: number[];
  color: string;
};

export type ChartConfigType = {
  chart: {
    height: number;
    spacingTop: number;
    spacingBottom: number;
    spacingLeft: number;
    spacingRight: number;
    backgroundColor: string;
  };
  accessibility: {
    enabled: boolean;
  };
  title: {
    text: null;
  };
  xAxis: {
    type: string;
    lineWidth: number;
    tickLength: number;
    labels: {
      step: number;
      style: {
        color: string;
      };
    };
    categories: string[];
  };
  yAxis: {
    gridLineWidth: number;
    title: {
      text: null;
    };
    labels: {
      style: {
        color: string;
      };
    };
  };
  legend: {
    enabled: boolean;
  };
  plotOptions: {
    spline: {
      lineWidth: number;
      states: {
        hover: {
          lineWidth: number;
        };
      };
      marker: {
        radius: number;
      };
    };
  };
  series: {
    type: string;
    data: { y: number; date: string; price: number }[];
    color: string;
  }[];
  exporting: {
    enabled: boolean;
  };
  credits: {
    enabled: boolean;
  };
} | null;

export type ChartInfo = {
  date: string;
  near_price: string;
  txns: string;
};

export type TransactionInfo = {
  actions: {
    action: string;
    method: string;
  }[];
  actions_agg: {
    deposit: string;
    gas_attached: string;
  };
  block: {
    block_height: string;
  };
  block_timestamp: string;
  included_in_block_hash: string;
  outcomes: {
    status: boolean;
  };
  outcomes_agg: {
    transaction_fee: string;
    gas_used: string;
  };
  shard_id: string;
  receipt_conversion_gas_burnt: string;
  receipt_conversion_tokens_burnt: string;
  receiver_account_id: string;
  signer_account_id: string;
  transaction_hash: string;
  receipts: InventoryInfo[];
  cause: string;
  affected_account_id: string;
  involved_account_id: string;
  token_id: string;
  nft: Token;
  delta_amount: string;
  ft: Token;
  predecessor_account_id: string;
};

export type ChartStat = {
  date: string;
  near_price: string;
  market_cap: string;
  total_supply: string;
  blocks: string;
  gas_fee: string;
  gas_used: string;
  avg_gas_price: string;
  avg_gas_limit: string;
  txns: string;
  txn_volume: string;
  txn_volume_usd: string;
  txn_fee: string;
  txn_fee_usd: string;
  total_addresses: string;
  addresses: string;
  active_accounts: string;
};

export type ChartTypeInfo = {
  title: string;
  description: string;
};

export type ChartConfig = {
  chart: {
    height: number;
    zoomType: string;
  };
  title: {
    text: string;
  };
  subtitle: {
    text: string;
  };
};

export type EpochStartBlock = {
  height: number;
  timestamp: number;
  totalSupply: string;
};
export type SearchResult = {
  accounts?: Array<{ account_id: string }>;
  txns?: Array<{ transaction_hash: string }>;
  receipts?: Array<{
    receipt_id: string;
    originated_from_transaction_hash: string;
  }>;
  blocks?: Array<{ block_hash: string; block_height: string }>;
};
export type SearchRoute = {
  type?: string;
  path?: string;
};
export type Debounce<TArgs extends any[]> = {
  (args: TArgs): void;
  cancel(): void;
  isPending(): boolean;
  flush(args: TArgs): void;
};

export type FunctionCallInfo = {
  args: string;
  deposit: string;
  gas: string;
  method_name: string;
};

export type GasProfileInfo = {
  cost: string;
  cost_category: string;
  gas_used: string;
};

export type OutcomePropsInfo = {
  executor_id: string;
  gas_burnt: string;
  logs: [];
  metadata: {
    gas_profile: GasProfileInfo[];
    version: string;
  };
  outgoing_receipts: {
    actions: {
      action_kind: string;
      args: {
        stake: string;
        deposit: string;
      };
    }[];
    outcome: OutcomePropsInfo;
  };
  receipt_ids: string[];
  status: {
    Failure: {
      ActionError: {
        index: number;
        kind: {
          FunctionCallError: {
            ExecutionError: string;
          };
        };
      };
    };
  };
  tokens_burnt: string;
};

export type OutcomeInfo = {
  block_hash: string;
  id: string;
  outcome: OutcomePropsInfo;
  proof: {
    direction: string;
    hash: string;
  }[];
};

export type ReceiptsInfo = {
  predecessor_id: string;
  receipt: {
    Action: {
      actions: {
        FunctionCall: FunctionCallInfo;
      }[];
      gas_price: string;
      input_data_ids: [];
      output_data_receivers: [];
      signer_id: string;
      signer_public_key: string;
    };
  };
  receipt_id: string;
  receiver_id: string;
};

export type InfoStatus = {
  Failure: {
    ActionError: {
      index: number;
      kind: {
        FunctionCallError: {
          ExecutionError: string;
        };
      };
    };
  };
};

export type TransInfo = {
  actions: {
    FunctionCall: FunctionCallInfo[];
  }[];
  hash: string;
  nonce: number;
  public_key: string;
  receiver_id: string;
  signature: string;
  signer_id: string;
};

export type RPCTransactionInfo = {
  receipts: ReceiptsInfo[];
  receipts_outcome: OutcomeInfo[];
  status: InfoStatus;
  transaction: TransInfo;
  transaction_outcome: OutcomeInfo;
};

export type TransactionLog = {
  contract: string;
  logs: string;
};

export type ActionType = {
  [key: string]: any;
};

export type Obj = {
  [key: string]: string | Obj;
};

export type AccountContractInfo = {
  amount: string;
  block_hash: string;
  block_height: string;
  code_hash: string;
  locked: string;
  storage_paid_at: string;
  storage_usage: string;
  account_id: string;
  public_key: string;
  permission_kind: string;
  created: {
    transaction_hash: string;
    block_timestamp: string;
  };
  deleted: {
    transaction_hash: string;
    block_timestamp: string;
  };
};

export type EventPropsInfo = {
  event: TransactionLog;
};

export type DepositPropsInfo = {
  event: {
    token_id: string;
    account_id: string;
    amount: string;
  }[];
};

export type ActionPropsInfo = {
  action: {
    from: string;
    to: string;
    action_kind: string;
    args: ArgsPropsInfo;
  };
  receiver?: string;
};
export type ArgsPropsInfo = {
  access_key: {
    permission: {
      permission_kind: string;
      FunctionCall: {
        method_names: [];
        receiver_id: string;
      };
    };
  };
  delegate_action: {
    actions: {
      FunctionCall: {
        method_name: string;
        args: string;
        deposit: string;
        gas: string;
      };
    }[];
    max_block_height: string;
    nonce: string;
    public_key: string;
    receiver_id: string;
    sender_id: string;
  };
  public_key: string;
  beneficiary_id: string;
  method_name: string;
  args_base64: string;
  args: string;
  stake: string;
  deposit: string;
};

export type TransactionActionInfo = {
  args: ArgsPropsInfo;
  receiver: string;
  action?: any;
};

export type ReceiptsPropsInfo = {
  actions: {
    action_kind: string;
    args: {
      deposit: string;
      access_key: {
        nonce: string;
        permission: string;
      };
      public_key: string;
    };
  }[];
  block_hash: string;
  id: string;
  outcome: {
    executor_id: string;
    gas_burnt: string;
    logs: [];
    metadata: {
      gas_profile: [];
      version: string;
    };
    receipt_ids: string[];
    status: {
      SuccessValue: string;
    };
    tokens_burnt: string;
    outgoing_receipts: {
      predecessor_id: string;
      receipt: {
        Action: {
          actions: [
            {
              Transfer: {
                deposit: string;
              };
            },
          ];
          gas_price: string;
          input_data_ids: [];
          output_data_receivers: [];
          signer_id: string;
          signer_public_key: string;
        };
      };
      receipt_id: string;
      receiver_id: string;
      actions: {
        action_kind: string;
        args: {
          deposit: string;
        };
      }[];
      block_hash: string;
      id: string;
      outcome: {
        executor_id: string;
        gas_burnt: string;
        logs: [];
        metadata: {
          gas_profile: [];
          version: string;
        };
        receipt_ids: [];
        status: {
          SuccessValue: string;
        };
        tokens_burnt: string;
        outgoing_receipts: [];
      };
      proof: {
        direction: string;
        hash: string;
      }[];
    }[];
  };
  predecessor_id: string;
  proof: {
    direction: string;
    hash: string;
  }[];
  receipt: {
    Action: {
      actions: [
        string,
        {
          Transfer: {
            deposit: string;
          };
        },
        {
          AddKey: {
            access_key: {
              nonce: 0;
              permission: string;
            };
            public_key: string;
          };
        },
      ];
      gas_price: string;
      input_data_ids: [];
      output_data_receivers: [];
      signer_id: string;
      signer_public_key: string;
    };
  };
  receipt_id: string;
  receiver_id: string;
};

export type Sorting = {
  sort: string;
  order: 'asc' | 'desc';
};

export type Token = {
  name: string;
  contract: string;
  icon: string;
  symbol: string;
  price: string;
  change_24: string;
  volume_24h: string;
  market_cap: string;
  onchain_market_cap: string;
  fully_diluted_market_cap: string;
  total_supply: string;
  circulating_supply: string;
  description: string;
  coingecko_id: string;
  coinmarketcap_id: string;
  holders: string;
  base_uri: string;
  reference: string;
  tokens: string;
  transfers: string;
  transfers_3days: string;
  transfers_day: string;
  website: string;
  meta: {
    twitter: string;
    facebook: string;
    telegram: string;
    coingecko_id: string;
  };
  token: string;
  media: string;
  asset: {
    owner: string;
  };
  decimals: string;
  title: string;
  nft: Token;
};

export type TransActionProps = {
  key: number;
  action: {
    action_kind: string;
    args: ArgsPropsInfo;
  };
  receiver: any;
};

export type TokenInfoProps = {
  contract: string;
  amount: string;
  decimals?: any;
};

export type ValidatorFullData = {
  validatorEpochData: ValidatorEpochData[];
  currentValidators: string;
  totalStake: string;
  seatPrice: string;
  elapsedTime: string;
  totalSeconds: string;
  epochProgress: string;
  validatorTelemetry: {
    [accountId: string]: ValidatorTelemetry;
  };
  total: string;
  lastEpochApy: string;
};

export type ReceiptStatsProps = {
  receipt: {
    outcome: {
      status: {
        SuccessValue?: any;
        Failure?: any;
        SuccessReceiptId?: any;
      };
    };
  };
};

export type HoldersPropsInfo = {
  account: string;
  quantity: string;
  amount: string;
};

export type NFTImageProps = {
  base?: string;
  media?: string;
  alt?: string;
  reference: string;
  className?: string;
  ownerId?: string;
  network?: string;
};

export type AccessInfo = {
  block_hash: string;
  block_height: string;
  keys: KeysInfo[];
  hash: string;
  nonce: string;
  permission: {
    FunctionCall: {
      allowance: string;
      method_names: [];
      receiver_id: string;
    };
  };
  error: string;
};

type U8 = number;
type U32 = number;
type U64 = number;
type U128 = string;
type Option<T> = T | null;
type String = string;
type AccountId = string;
type CryptoHash = string;
type Balance = U128;
type Vec<T> = T[];
type Gas = string;
type Signature = string;
type MerkleHash = CryptoHash;
type Direction = 'Left' | 'Right';

type MerklePathItem = {
  hash: MerkleHash;
  direction: Direction;
};
type MerklePath = Vec<MerklePathItem>;

type CostGasUsed = {
  cost_category: String;
  cost: String;
  gas_used: Gas;
};

type ExecutionMetadataView = {
  version: U32;
  gas_profile: Option<Vec<CostGasUsed>>;
};

export type Nonce = string;

export type AccessKeyView = {
  nonce: Nonce;
  permission: AccessKeyPermissionView;
};

export type ActionError = {
  index: U64;
  kind: ActionErrorKind;
};

type ActionErrorKind =
  | { AccountAlreadyExists: { account_id: AccountId } }
  | { AccountDoesNotExist: { account_id: AccountId } }
  | {
      CreateAccountOnlyByRegistrar: {
        account_id: AccountId;
        registrar_account_id: AccountId;
        predecessor_id: AccountId;
      };
    }
  | {
      CreateAccountNotAllowed: {
        account_id: AccountId;
        predecessor_id: AccountId;
      };
    }
  | { ActorNoPermission: { account_id: AccountId; actor_id: AccountId } }
  | { DeleteKeyDoesNotExist: { account_id: AccountId; public_key: PublicKey } }
  | { AddKeyAlreadyExists: { account_id: AccountId; public_key: PublicKey } }
  | { DeleteAccountStaking: { account_id: AccountId } }
  | { LackBalanceForState: { account_id: AccountId; amount: Balance } }
  | { TriesToUnstake: { account_id: AccountId } }
  | {
      TriesToStake: {
        account_id: AccountId;
        stake: Balance;
        locked: Balance;
        balance: Balance;
      };
    }
  | {
      InsufficientStake: {
        account_id: AccountId;
        stake: Balance;
        minimum_stake: Balance;
      };
    }
  | { FunctionCallError: FunctionCallError }
  | { NewReceiptValidationError: NewReceiptValidationError }
  | { OnlyImplicitAccountCreationAllowed: { account_id: AccountId } }
  | { DeleteAccountWithLargeState: { account_id: AccountId } }
  | 'DelegateActionInvalidSignature'
  | {
      DelegateActionSenderDoesNotMatchTxReceiver: {
        sender_id: AccountId;
        receiver_id: AccountId;
      };
    }
  | 'DelegateActionExpired'
  | { DelegateActionAccessKeyError: InvalidAccessKeyError }
  | { DelegateActionInvalidNonce: { delegate_nonce: Nonce; ak_nonce: Nonce } }
  | {
      DelegateActionNonceTooLarge: {
        delegate_nonce: Nonce;
        upper_bound: Nonce;
      };
    };

export type InvalidTxError =
  | { InvalidAccessKeyError: InvalidAccessKeyError }
  | { InvalidSignerId: { signer_id: String } }
  | { SignerDoesNotExist: { signer_id: AccountId } }
  | { InvalidNonce: { tx_nonce: Nonce; ak_nonce: Nonce } }
  | { NonceTooLarge: { tx_nonce: Nonce; upper_bound: Nonce } }
  | { InvalidReceiverId: { receiver_id: String } }
  // https://docs.rs/near-primitives/0.12.0/near_primitives/errors/enum.InvalidTxError.html#variant.InvalidSignature
  | { InvalidSignature: unknown }
  | {
      NotEnoughBalance: {
        signer_id: AccountId;
        balance: Balance;
        cost: Balance;
      };
    }
  | { LackBalanceForState: { signer_id: AccountId; amount: Balance } }
  | { CostOverflow: unknown }
  | { InvalidChain: unknown }
  | { Expired: unknown }
  // https://docs.rs/near-primitives/0.12.0/near_primitives/errors/enum.ActionsValidationError.html
  | { ActionsValidation: unknown }
  | { TransactionSizeExceeded: { size: U64; limit: U64 } };

export type TxExecutionError =
  | { ActionError: ActionError }
  | { InvalidTxError: InvalidTxError }
  | {};

export type ExecutionStatusView =
  | { Unknown: unknown }
  | { Failure: TxExecutionError }
  | { SuccessValue: String }
  | { SuccessReceiptId: CryptoHash }
  | {
      Failure: {
        ActionError: {
          index: number;
          kind: { FunctionCallError: { ExecutionError: string } };
        };
      };
    };

export type ExecutionOutcomeView = {
  logs: Vec<String>;
  receipt_ids: Vec<CryptoHash>;
  gas_burnt: Gas;
  tokens_burnt: Balance;
  executor_id: AccountId;
  status: ExecutionStatusView;
  metadata: ExecutionMetadataView;
};

export type AccessKeyPermissionView =
  | {
      FunctionCall: {
        allowance: Option<Balance>;
        receiver_id: String;
        method_names: Vec<String>;
      };
    }
  | 'FullAccess';

export type DeployContractActionView = {
  DeployContract: {
    code: String;
  };
};
export type FunctionCallActionView = {
  FunctionCall: {
    method_name: String;
    args: String;
    gas: Gas;
    deposit: Balance;
  };
};
export type TransferActionView = {
  Transfer: {
    deposit: Balance;
  };
};
export type StakeActionView = {
  Stake: {
    stake: Balance;
    public_key: PublicKey;
  };
};
export type AddKeyActionView = {
  AddKey: {
    public_key: PublicKey;
    access_key: AccessKeyView;
  };
};
export type DeleteKeyActionView = {
  DeleteKey: {
    public_key: PublicKey;
  };
};
export type DeleteAccountActionView = {
  DeleteAccount: {
    beneficiary_id: AccountId;
  };
};
export type DelegateActionView = {
  Delegate: {
    delegate_action: DelegateAction;
    signature: Signature;
  };
};

export type ActionView =
  | 'CreateAccount'
  | DeployContractActionView
  | FunctionCallActionView
  | TransferActionView
  | StakeActionView
  | AddKeyActionView
  | DeleteKeyActionView
  | DeleteAccountActionView
  | DelegateActionView
  | any;

export type PublicKey = string;
type DataReceiverView = {
  data_id: CryptoHash;
  receiver_id: AccountId;
};
type ReceiptEnumView =
  | {
      Action: {
        signer_id: AccountId;
        signer_public_key: PublicKey;
        gas_price: Balance;
        output_data_receivers: Vec<DataReceiverView>;
        input_data_ids: Vec<CryptoHash>;
        actions: Vec<ActionView>;
      };
    }
  | {
      Data: {
        data_id: CryptoHash;
        data: Option<Vec<U8>>;
      };
    };

export type ReceiptView = {
  predecessor_id: AccountId;
  receiver_id: AccountId;
  receipt_id: CryptoHash;
  receipt: ReceiptEnumView;
};

export type FailedToFindReceipt = { id: string };

export type NonDelegateAction =
  | {
      kind: 'createAccount';
      args: {};
    }
  | {
      kind: 'deployContract';
      args: {
        code: string;
      };
    }
  | {
      kind: 'functionCall';
      args: {
        methodName: string;
        args: string;
        gas: string;
        deposit: string;
      };
    }
  | {
      kind: 'transfer';
      args: {
        deposit: string;
      };
    }
  | {
      kind: 'stake';
      args: {
        stake: string;
        publicKey: string;
      };
    }
  | {
      kind: 'addKey';
      args: {
        publicKey: string;
        accessKey: {
          nonce: string;
          permission:
            | {
                type: 'fullAccess';
              }
            | {
                type: 'functionCall';
                contractId: string;
                methodNames: string[];
              };
        };
      };
    }
  | {
      kind: 'deleteKey';
      args: {
        publicKey: string;
      };
    }
  | {
      kind: 'deleteAccount';
      args: {
        beneficiaryId: string;
      };
    };

type DelegateAction = {
  kind: 'delegateAction';
  args: {
    actions: (NonDelegateAction & { delegateIndex: number })[];
    receiverId: string;
    senderId: string;
  };
};
export type UnknownError = { type: 'unknown' };

type ActionsValidation = unknown;
export type RPCNewReceiptValidationError =
  | { InvalidPredecessorId: { account_id: String } }
  | { InvalidReceiverId: { account_id: String } }
  | { InvalidSignerId: { account_id: String } }
  | { InvalidDataReceiverId: { account_id: String } }
  | { ReturnedValueLengthExceeded: { length: U64; limit: U64 } }
  | {
      NumberInputDataDependenciesExceeded: {
        number_of_input_data_dependencies: U64;
        limit: U64;
      };
    }
  | { ActionsValidation: ActionsValidation }
  | {};

export type NewReceiptValidationError =
  | { type: 'invalidPredecessorId'; accountId: String }
  | { type: 'invalidReceiverId'; accountId: String }
  | { type: 'invalidSignerId'; accountId: String }
  | { type: 'invalidDataReceiverId'; accountId: String }
  | { type: 'returnedValueLengthExceeded'; length: number; limit: number }
  | {
      type: 'numberInputDataDependenciesExceeded';
      numberOfInputDataDependencies: number;
      limit: number;
    }
  | { type: 'actionsValidation' }
  | UnknownError;

export type CompilationError =
  | { type: 'codeDoesNotExist'; accountId: string }
  | { type: 'prepareError' }
  | { type: 'wasmerCompileError'; msg: string }
  | { type: 'unsupportedCompiler'; msg: string }
  | UnknownError;

export type RPCCompilationError =
  | { CodeDoesNotExist: { account_id: AccountId } }
  // https://docs.rs/near-vm-errors/0.12.0/near_vm_errors/enum.PrepareError.html
  | { PrepareError: unknown }
  | { WasmerCompileError: { msg: String } }
  | { UnsupportedCompiler: { msg: String } };

export type FunctionCallError =
  | {
      type: 'compilationError';
      error: CompilationError;
    }
  | { type: 'linkError'; msg: string }
  | { type: 'methodResolveError' }
  | { type: 'wasmTrap' }
  | { type: 'wasmUnknownError' }
  | { type: 'hostError' }
  | { type: 'evmError' }
  | { type: 'executionError'; error: string }
  | UnknownError;

export type RPCFunctionCallError =
  | { CompilationError: RPCCompilationError }
  | { LinkError: { msg: String } }
  // https://docs.rs/near-vm-errors/0.12.0/near_vm_errors/enum.MethodResolveError.html
  | { MethodResolveError: unknown }
  // https://docs.rs/near-vm-errors/0.12.0/near_vm_errors/enum.WasmTrap.html
  | { WasmTrap: unknown }
  // https://docs.rs/near-vm-errors/0.12.0/near_vm_errors/enum.FunctionCallErrorSer.html#variant.WasmUnknownError
  | { WasmUnknownError: unknown }
  // https://docs.rs/near-vm-errors/0.12.0/near_vm_errors/enum.HostError.html
  | { HostError: unknown }
  | { _EVMError: unknown }
  | { ExecutionError: String }
  | {};

export type InvalidAccessKeyError =
  | { type: 'depositWithFunctionCall' }
  | { type: 'requiresFullAccess' }
  | { type: 'accessKeyNotFound'; accountId: string; publicKey: string }
  | {
      type: 'receiverMismatch';
      akReceiver: string;
      transactionReceiver: string;
    }
  | { type: 'methodNameMismatch'; methodName: string }
  | {
      type: 'notEnoughAllowance';
      accountId: string;
      allowance: string;
      cost: string;
      publicKey: string;
    }
  | UnknownError;

export type RPCInvalidAccessKeyError =
  | {
      AccessKeyNotFound: {
        account_id: AccountId;
        public_key: PublicKey;
      };
    }
  | {
      ReceiverMismatch: {
        tx_receiver: AccountId;
        ak_receiver: String;
      };
    }
  | {
      MethodNameMismatch: {
        method_name: String;
      };
    }
  | 'RequiresFullAccess'
  | {
      NotEnoughAllowance: {
        account_id: AccountId;
        public_key: PublicKey;
        allowance: Balance;
        cost: Balance;
      };
    }
  | 'DepositWithFunctionCall'
  | InvalidAccessKeyError;

export type ReceiptActionError =
  | {
      type: 'accountAlreadyExists';
      accountId: string;
    }
  | {
      type: 'accountDoesNotExist';
      accountId: string;
    }
  | {
      type: 'createAccountOnlyByRegistrar';
      accountId: string;
      registrarAccountId: string;
      predecessorId: string;
    }
  | {
      type: 'createAccountNotAllowed';
      accountId: string;
      predecessorId: string;
    }
  | {
      type: 'actorNoPermission';
      accountId: string;
      actorId: string;
    }
  | {
      type: 'deleteKeyDoesNotExist';
      accountId: string;
      publicKey: string;
    }
  | {
      type: 'addKeyAlreadyExists';
      accountId: string;
      publicKey: string;
    }
  | {
      type: 'deleteAccountStaking';
      accountId: string;
    }
  | {
      type: 'lackBalanceForState';
      accountId: string;
      amount: string;
    }
  | {
      type: 'triesToUnstake';
      accountId: string;
    }
  | {
      type: 'triesToStake';
      accountId: string;
      stake: string;
      locked: string;
      balance: string;
    }
  | {
      type: 'insufficientStake';
      accountId: string;
      stake: string;
      minimumStake: string;
    }
  | {
      type: 'functionCallError';
      error: FunctionCallError;
    }
  | {
      type: 'newReceiptValidationError';
      error: NewReceiptValidationError;
    }
  | { type: 'onlyImplicitAccountCreationAllowed'; accountId: string }
  | { type: 'deleteAccountWithLargeState'; accountId: string }
  | { type: 'delegateActionExpired' }
  | { type: 'delegateActionInvalidSignature' }
  | {
      type: 'delegateActionSenderDoesNotMatchTxReceiver';
      receiverId: string;
      senderId: string;
    }
  | { type: 'delegateActionAccessKeyError'; error: InvalidAccessKeyError }
  | {
      type: 'delegateActionInvalidNonce';
      akNonce: number;
      delegateNonce: number;
    }
  | {
      type: 'delegateActionNonceTooLarge';
      delegateNonce: number;
      upperBound: number;
    }
  | UnknownError;

export type ReceiptTransactionError =
  | { type: 'invalidAccessKeyError'; error: InvalidAccessKeyError }
  | { type: 'invalidSignerId'; signerId: string }
  | { type: 'signerDoesNotExist'; signerId: string }
  | { type: 'invalidNonce'; transactionNonce: number; akNonce: number }
  | { type: 'nonceTooLarge'; transactionNonce: number; upperBound: number }
  | { type: 'invalidReceiverId'; receiverId: string }
  | { type: 'invalidSignature' }
  | {
      type: 'notEnoughBalance';
      signerId: string;
      balance: string;
      cost: string;
    }
  | { type: 'lackBalanceForState'; signerId: string; amount: string }
  | { type: 'costOverflow' }
  | { type: 'invalidChain' }
  | { type: 'expired' }
  | { type: 'actionsValidation' }
  | { type: 'transactionSizeExceeded'; size: number; limit: number }
  | UnknownError;

export type ReceiptExecutionStatusError =
  | {
      type: 'action';
      error: ReceiptActionError;
    }
  | {
      type: 'transaction';
      error: ReceiptTransactionError;
    }
  | UnknownError;

export type Action = NonDelegateAction | DelegateAction;

export type ReceiptExecutionStatus =
  | {
      type: 'failure';
      error: ReceiptExecutionStatusError;
    }
  | {
      type: 'successValue';
      value: string;
    }
  | {
      type: 'successReceiptId';
      receiptId: string;
    }
  | {
      type: 'unknown';
    };

export type NestedReceiptWithOutcomeOld = {
  id: string;
  predecessorId: string;
  receiverId: string;
  actions: Action[];
  outcome: {
    blockHash: string;
    tokensBurnt: string;
    gasBurnt: string;
    status: ReceiptExecutionStatus;
    logs: string[];
    nestedReceipts: (NestedReceiptWithOutcomeOld | FailedToFindReceipt)[];
  };
};

export type NestedReceiptWithOutcome = Omit<
  NestedReceiptWithOutcomeOld,
  'outcome'
> & {
  outcome: Omit<
    NestedReceiptWithOutcomeOld['outcome'],
    'nestedReceipts' | 'blockHash'
  > & {
    block: {
      hash: string;
      height: string;
      timestamp: string;
    };
    nestedReceipts: (NestedReceiptWithOutcome | FailedToFindReceipt)[];
  };
};

export type ParsedReceipt = Omit<NestedReceiptWithOutcome, 'outcome'> & {
  outcome: Omit<NestedReceiptWithOutcome['outcome'], 'nestedReceipts'> & {
    receiptIds: string[];
  };
};

export type ExecutionOutcomeWithIdView = {
  proof: MerklePath;
  block_hash: CryptoHash;
  id: CryptoHash;
  outcome: ExecutionOutcomeView;
};

export type SignedTransactionView = {
  signer_id: AccountId;
  public_key: PublicKey;
  nonce: Nonce;
  receiver_id: AccountId;
  actions: Vec<ActionView>;
  signature: Signature;
  hash: CryptoHash;
};

export type NonDelegateActionView = Exclude<ActionView, DelegateActionView>;

export type ParseOutcomeInfo = {
  block_hash: string;
  outcome: {
    executor_id: string;
    gas_burnt: string;
    logs: [];
    metadata: {
      gas_profile: GasProfileInfo[];
      version: string;
    };
    outgoing_receipts: {
      actions: {
        action_kind: string;
        args: {
          stake: string;
          deposit: string;
        };
      }[];
      outcome: OutcomePropsInfo;
    };
    receipt_ids: string[];
    status: {
      Failure: {
        ActionError: {
          index: number;
          kind: {
            FunctionCallError: {
              ExecutionError: string;
            };
          };
        };
      };
    };
    tokens_burnt: string;
  };
};

export type TransactionReceiptInfo = {
  receipt: any;
  fellowOutgoingReceipts: any;
  expandAll: any;
  convertionReceipt: any;
  className: string;
};

export type ReceiptKindInfo = {
  action: any;
  onClick?: any;
  isTxTypeActive: boolean;
  receiver: string;
};
export type CommentItem = {
  accountId: string;
  blockHeight: number;
  value: {
    post: {
      image?: {
        ipfs_cid: string;
      };
      text?: string;
    };
  };
  type: string;
};
export type CommentContent = {
  type: string;
  text?: string;
  image?:
    | {
        cid?: string;
        url?: string;
      }
    | undefined;
};

export type ContractParseInfo = {
  byMethod: {
    [methodName: string]: [];
  };
  methodNames: [];
  probableInterfaces: [];
};

export type FieldType = {
  id: string;
  name: string;
  type: string;
  value: string;
  placeholder: string;
};

export type SchemaInfo = {
  schema_version: string;
  metadata: {
    name: string;
    version: string;
    build: {
      compiler: string;
      builder: string;
    };
  };
  body: {
    functions: {
      name: string;
      kind: string;
      params: {
        serialization_type: string;
        args: [
          {
            name: string;
            type_schema: {
              $ref: string;
            };
          },
        ];
      };
      result: {
        serialization_type: string;
        type_schema: {
          type: [];
        };
      };
    }[];
    root_schema: {
      $schema: string;
      title: String;
      type: string;
      definitions: {
        AccountId: {
          description: string;
          type: string;
        };
      };
    };
  };
};

export type FieldValueTypes = string | boolean | number | null;

export type Status = {
  aggregates: {
    ft_holders: { height: number; sync: boolean; timestamp: string };
    nft_holders: { height: number; sync: boolean; timestamp: string };
  };
  indexers: {
    balance: { height: number; sync: boolean };
    base: { height: string; sync: boolean };
    events: { height: number; sync: boolean };
  };
};

export type chartDataInfo = {
  date: string;
  txns: string;
  shards: { txns: string; shard: string }[];
};

export type AccountDataInfo = {
  amount: string;
  locked: string;
  code_hash: string;
  storage_usage: string;
  storage_paid_at: string;
  block_height: string;
  block_hash: string;
};
export type SpamToken = {
  blacklist: string[];
};

export type GuessableTypeString =
  | 'null'
  | 'string'
  | 'number'
  | 'boolean'
  | 'json';

export type DelegatorInfo = {
  account_id: string;
  can_withdraw: boolean;
  staked_balance: string;
  unstaked_balance: string;
};

export type RewardFraction = {
  denominator: number;
  numerator: number;
};

export type ValidatorStatus = {
  currentEpoch: boolean;
  nextEpoch: boolean;
  afterNextEpoch: boolean;
};

export type VerifierData = {
  block_height?: number;
  cid?: string;
  code_hash?: string;
  lang?: string;
};

export type VerifierStatus = 'verified' | 'mismatch' | 'pending';

export type VerificationData = {
  status: VerifierStatus;
  data: VerifierData | null;
};

export type ContractMetadata = {
  build_info?: {
    build_command: string[];
    build_environment: string;
    contract_path: string;
    source_code_snapshot: string;
  };
  link?: string;
  standards?: { standard: string; version: string }[];
  version?: string;
};
