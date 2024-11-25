import type { NextPage } from 'next';
import type { ReactElement, ReactNode } from 'react';

import { ValidatorEpochData, ValidatorTelemetry } from 'nb-types';

export type NextPageWithLayout<T = any> = NextPage<T> & {
  getLayout?: (page: ReactElement<any>) => ReactNode;
};

export type NetworkId = ProductionNetwork['networkId'];
export type Network = ProductionNetwork;

type ProductionNetwork = {
  networkId: 'mainnet' | 'testnet';
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
  icon: string;
  name: string;
  price: string;
  symbol: string;
  website: string;
};

export type Stats = {
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
};

export type MetaInfo = {
  contract: string;
  decimals: string;
  icon: string;
  name: string;
  price: string;
  reference: string;
  symbol: string;
};

export type FtsInfo = {
  affected_account_id: string;
  block_timestamp: string;
  cause: string;
  contract: string;
  delta_amount: string;
  event_index: string;
  ft_meta: MetaInfo;
  involved_account_id: string;
};

export type NftsInfo = {
  affected_account_id: string;
  block_timestamp: string;
  cause: string;
  contract: string;
  delta_amount: string;
  event_index: string;
  involved_account_id: string;
  nft_meta: MetaInfo;
  nft_token_meta: string;
  quantity: string;
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
  hash: string;
  keys: KeysInfo[];
};

export type ContractInfo = {
  hash: string;
  locked?: boolean;
};

export type TokenListInfo = {
  amount: string;
  amountUsd: string;
  contract: string;
  ft_meta: MetaInfo;
  rpcAmount: string;
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
  tps: string;
  volume: string;
};

export type ChartSeriesInfo = {
  color: string;
  data: number[];
  type: string;
};

export type ChartConfigType = {
  accessibility: {
    enabled: boolean;
  };
  chart: {
    backgroundColor: string;
    height: number;
    spacingBottom: number;
    spacingLeft: number;
    spacingRight: number;
    spacingTop: number;
  };
  credits: {
    enabled: boolean;
  };
  exporting: {
    enabled: boolean;
  };
  legend: {
    enabled: boolean;
  };
  plotOptions: {
    spline: {
      lineWidth: number;
      marker: {
        radius: number;
      };
      states: {
        hover: {
          lineWidth: number;
        };
      };
    };
  };
  series: {
    color: string;
    data: { date: string; price: number; y: number }[];
    type: string;
  }[];
  title: {
    text: null;
  };
  xAxis: {
    categories: string[];
    labels: {
      step: number;
      style: {
        color: string;
      };
    };
    lineWidth: number;
    tickLength: number;
    type: string;
  };
  yAxis: {
    gridLineWidth: number;
    labels: {
      style: {
        color: string;
      };
    };
    title: {
      text: null;
    };
  };
} | null;

export type ChartInfo = {
  date: string;
  near_price: string;
  txns: string;
};

export type DexTransactionInfo = {
  amount_usd: string;
  base_amount: string;
  event_index: string;
  maker: string;
  pair_id: string;
  price_token: string;
  price_usd: string;
  quote_amount: string;
  receipt_id: string;
  timestamp: number;
  type: string;
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
  affected_account_id: string;
  block: {
    block_height: string;
  };
  block_timestamp: string;
  cause: string;
  delta_amount: string;
  ft: Token;
  included_in_block_hash: string;
  involved_account_id: string;
  nft: Token;
  outcomes: {
    status: boolean;
  };
  outcomes_agg: {
    gas_used: string;
    transaction_fee: string;
  };
  predecessor_account_id: string;
  receipt_conversion_gas_burnt: string;
  receipt_conversion_tokens_burnt: string;
  receipt_id: string;
  receipt_outcome: {
    executor_account_id: string;
    gas_burnt: string;
    status: boolean;
    tokens_burnt: string;
  };
  receipts: InventoryInfo[];
  receiver_account_id: string;
  shard_id: string;
  signer_account_id: string;
  token_id: string;
  transaction_hash: string;
};

export type ChartStat = {
  active_accounts: string;
  addresses: string;
  avg_gas_limit: string;
  avg_gas_price: string;
  blocks: string;
  date: string;
  gas_fee: string;
  gas_used: string;
  market_cap: string;
  multichain_txns: string;
  near_price: string;
  total_addresses: string;
  total_supply: string;
  txn_fee: string;
  txn_fee_usd: string;
  txn_volume: string;
  txn_volume_usd: string;
  txns: string;
};

export type ChartTypeInfo = {
  description: string;
  title: string;
};

export type ChartConfig = {
  chart: {
    height: number;
    zoomType: string;
  };
  subtitle: {
    text: string;
  };
  title: {
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
  blocks?: Array<{ block_hash: string; block_height: string }>;
  receipts?: Array<{
    originated_from_transaction_hash: string;
    receipt_id: string;
  }>;
  txns?: Array<{ transaction_hash: string }>;
};
export type SearchRoute = {
  path?: string;
  type?: string;
};
export type Debounce<TArgs extends any[]> = {
  (args: TArgs): void;
  cancel(): void;
  flush(args: TArgs): void;
  isPending(): boolean;
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
        deposit: string;
        stake: string;
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
  receiptId?: string;
};

export type ActionType = {
  [key: string]: any;
};

export type Obj = {
  [key: string]: Obj | string;
};

export type AccountContractInfo = {
  account_id: string;
  amount: string;
  block_hash: string;
  block_height: string;
  code_hash: string;
  created: {
    block_timestamp: string;
    transaction_hash: string;
  };
  deleted: {
    block_timestamp: string;
    transaction_hash: string;
  };
  locked: string;
  permission_kind: string;
  public_key: string;
  storage_paid_at: string;
  storage_usage: string;
};

export type EventPropsInfo = {
  event: TransactionLog;
};

export type DepositPropsInfo = {
  event: {
    account_id: string;
    amount: string;
    token_id: string;
  }[];
  receiptId?: string;
};

export type ActionPropsInfo = {
  action: {
    action_kind: string;
    args: ArgsPropsInfo;
    from: string;
    receiptId: string;
    to: string;
  };
  receiver?: string;
};
export type ArgsPropsInfo = {
  access_key: {
    permission: {
      FunctionCall: {
        method_names: [];
        receiver_id: string;
      };
      permission_kind: string;
    };
  };
  args: string;
  args_base64: string;
  beneficiary_id: string;
  delegate_action: {
    actions: {
      FunctionCall: {
        args: string;
        deposit: string;
        gas: string;
        method_name: string;
      };
    }[];
    max_block_height: string;
    nonce: string;
    public_key: string;
    receiver_id: string;
    sender_id: string;
  };
  deposit: string;
  method_name: string;
  public_key: string;
  stake: string;
};

export type TransactionActionInfo = {
  action?: any;
  args: ArgsPropsInfo;
  receiver: string;
};

export type ReceiptsPropsInfo = {
  actions: {
    action_kind: string;
    args: {
      access_key: {
        nonce: string;
        permission: string;
      };
      deposit: string;
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
    outgoing_receipts: {
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
        outgoing_receipts: [];
        receipt_ids: [];
        status: {
          SuccessValue: string;
        };
        tokens_burnt: string;
      };
      predecessor_id: string;
      proof: {
        direction: string;
        hash: string;
      }[];
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
    }[];
    receipt_ids: string[];
    status: {
      SuccessValue: string;
    };
    tokens_burnt: string;
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
  order: 'asc' | 'desc';
  sort: string;
};

export type Token = {
  asset: {
    owner: string;
  };
  base_uri: string;
  change_24: string;
  circulating_supply: string;
  coingecko_id: string;
  coinmarketcap_id: string;
  contract: string;
  decimals: string;
  description: string;
  fully_diluted_market_cap: string;
  holders: string;
  icon: string;
  market_cap: string;
  media: string;
  meta: {
    coingecko_id: string;
    facebook: string;
    telegram: string;
    twitter: string;
  };
  name: string;
  nep518_hex_address: string;
  nft: Token;
  onchain_market_cap: string;
  price: string;
  reference: string;
  symbol: string;
  title: string;
  token: string;
  tokens: string;
  total_supply: string;
  transfers: string;
  transfers_3days: string;
  transfers_day: string;
  volume_24h: string;
  website: string;
};

export type TransActionProps = {
  action: {
    action_kind: string;
    args: ArgsPropsInfo;
  };
  key: number;
  receiver: any;
};

export type TokenInfoProps = {
  amount: string;
  contract: string;
  decimals?: any;
};

export type ValidatorFullData = {
  currentValidators: string;
  elapsedTime: string;
  epochProgress: string;
  lastEpochApy: string;
  seatPrice: string;
  total: string;
  totalSeconds: string;
  totalStake: string;
  validatorEpochData: ValidatorEpochData[];
  validatorTelemetry: {
    [accountId: string]: ValidatorTelemetry;
  };
};

export type ReceiptStatsProps = {
  receipt: {
    outcome: {
      status: {
        Failure?: any;
        SuccessReceiptId?: any;
        SuccessValue?: any;
      };
    };
  };
};

export type HoldersPropsInfo = {
  account: string;
  amount: string;
  quantity: string;
};

export type NFTImageProps = {
  alt?: string;
  base?: string;
  className?: string;
  media?: string;
  network?: string;
  ownerId?: string;
  reference: string;
};

export type AccessInfo = {
  block_hash: string;
  block_height: string;
  error: string;
  hash: string;
  keys: KeysInfo[];
  nonce: string;
  permission: {
    FunctionCall: {
      allowance: string;
      method_names: [];
      receiver_id: string;
    };
  };
};

type U8 = number;
type U32 = number;
type U64 = number;
type U128 = string;
type Option<T> = null | T;
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
  direction: Direction;
  hash: MerkleHash;
};
type MerklePath = Vec<MerklePathItem>;

type CostGasUsed = {
  cost: String;
  cost_category: String;
  gas_used: Gas;
};

type ExecutionMetadataView = {
  gas_profile: Option<Vec<CostGasUsed>>;
  version: U32;
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

export type InvalidTxError =
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
  // https://docs.rs/near-primitives/0.12.0/near_primitives/errors/enum.InvalidTxError.html#variant.InvalidSignature
  | { InvalidNonce: { ak_nonce: Nonce; tx_nonce: Nonce } }
  | { InvalidReceiverId: { receiver_id: String } }
  | { InvalidSignature: unknown }
  | { InvalidSignerId: { signer_id: String } }
  | { LackBalanceForState: { amount: Balance; signer_id: AccountId } }
  | { NonceTooLarge: { tx_nonce: Nonce; upper_bound: Nonce } }
  // https://docs.rs/near-primitives/0.12.0/near_primitives/errors/enum.ActionsValidationError.html
  | { SignerDoesNotExist: { signer_id: AccountId } }
  | { TransactionSizeExceeded: { limit: U64; size: U64 } };

export type TxExecutionError =
  | { ActionError: ActionError }
  | { InvalidTxError: InvalidTxError }
  | {};

export type ExecutionStatusView =
  | {
      Failure: {
        ActionError: {
          index: number;
          kind: { FunctionCallError: { ExecutionError: string } };
        };
      };
    }
  | { Failure: TxExecutionError }
  | { SuccessReceiptId: CryptoHash }
  | { SuccessValue: String }
  | { Unknown: unknown };

export type ExecutionOutcomeView = {
  executor_id: AccountId;
  gas_burnt: Gas;
  logs: Vec<String>;
  metadata: ExecutionMetadataView;
  receipt_ids: Vec<CryptoHash>;
  status: ExecutionStatusView;
  tokens_burnt: Balance;
};

export type AccessKeyPermissionView =
  | 'FullAccess'
  | {
      FunctionCall: {
        allowance: Option<Balance>;
        method_names: Vec<String>;
        receiver_id: String;
      };
    };

export type DeployContractActionView = {
  DeployContract: {
    code: String;
  };
};
export type FunctionCallActionView = {
  FunctionCall: {
    args: String;
    deposit: Balance;
    gas: Gas;
    method_name: String;
  };
};
export type TransferActionView = {
  Transfer: {
    deposit: Balance;
  };
};
export type StakeActionView = {
  Stake: {
    public_key: PublicKey;
    stake: Balance;
  };
};
export type AddKeyActionView = {
  AddKey: {
    access_key: AccessKeyView;
    public_key: PublicKey;
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
  | AddKeyActionView
  | any
  | DelegateActionView
  | DeleteAccountActionView
  | DeleteKeyActionView
  | DeployContractActionView
  | FunctionCallActionView
  | StakeActionView
  | TransferActionView;

export type PublicKey = string;
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

export type ReceiptView = {
  predecessor_id: AccountId;
  receipt: ReceiptEnumView;
  receipt_id: CryptoHash;
  receiver_id: AccountId;
};

export type FailedToFindReceipt = { id: string };

export type NonDelegateAction =
  | {
      args: {
        accessKey: {
          nonce: string;
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
        gas: string;
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

type DelegateAction = {
  args: {
    actions: (NonDelegateAction & { delegateIndex: number })[];
    receiverId: string;
    senderId: string;
  };
  kind: 'delegateAction';
};
export type UnknownError = { type: 'unknown' };

type ActionsValidation = unknown;
export type RPCNewReceiptValidationError =
  | {
      NumberInputDataDependenciesExceeded: {
        limit: U64;
        number_of_input_data_dependencies: U64;
      };
    }
  | { ActionsValidation: ActionsValidation }
  | { InvalidDataReceiverId: { account_id: String } }
  | { InvalidPredecessorId: { account_id: String } }
  | { InvalidReceiverId: { account_id: String } }
  | { InvalidSignerId: { account_id: String } }
  | { ReturnedValueLengthExceeded: { length: U64; limit: U64 } }
  | {};

export type NewReceiptValidationError =
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
  | UnknownError;

export type CompilationError =
  | { accountId: string; type: 'codeDoesNotExist' }
  | { msg: string; type: 'unsupportedCompiler' }
  | { msg: string; type: 'wasmerCompileError' }
  | { type: 'prepareError' }
  | UnknownError;

export type RPCCompilationError =
  | { CodeDoesNotExist: { account_id: AccountId } }
  // https://docs.rs/near-vm-errors/0.12.0/near_vm_errors/enum.PrepareError.html
  | { PrepareError: unknown }
  | { UnsupportedCompiler: { msg: String } }
  | { WasmerCompileError: { msg: String } };

export type FunctionCallError =
  | {
      error: CompilationError;
      type: 'compilationError';
    }
  | { error: string; type: 'executionError' }
  | { msg: string; type: 'linkError' }
  | { type: 'evmError' }
  | { type: 'hostError' }
  | { type: 'methodResolveError' }
  | { type: 'wasmTrap' }
  | { type: 'wasmUnknownError' }
  | UnknownError;

export type RPCFunctionCallError =
  | { _EVMError: unknown }
  | { CompilationError: RPCCompilationError }
  // https://docs.rs/near-vm-errors/0.12.0/near_vm_errors/enum.MethodResolveError.html
  | { ExecutionError: String }
  // https://docs.rs/near-vm-errors/0.12.0/near_vm_errors/enum.WasmTrap.html
  | { HostError: unknown }
  // https://docs.rs/near-vm-errors/0.12.0/near_vm_errors/enum.FunctionCallErrorSer.html#variant.WasmUnknownError
  | { LinkError: { msg: String } }
  // https://docs.rs/near-vm-errors/0.12.0/near_vm_errors/enum.HostError.html
  | { MethodResolveError: unknown }
  | { WasmTrap: unknown }
  | { WasmUnknownError: unknown }
  | {};

export type InvalidAccessKeyError =
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
  | UnknownError;

export type RPCInvalidAccessKeyError =
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
        method_name: String;
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
        ak_receiver: String;
        tx_receiver: AccountId;
      };
    }
  | InvalidAccessKeyError;

export type ReceiptActionError =
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
      error: FunctionCallError;
      type: 'functionCallError';
    }
  | {
      error: NewReceiptValidationError;
      type: 'newReceiptValidationError';
    }
  | {
      receiverId: string;
      senderId: string;
      type: 'delegateActionSenderDoesNotMatchTxReceiver';
    }
  | { accountId: string; type: 'deleteAccountWithLargeState' }
  | { accountId: string; type: 'onlyImplicitAccountCreationAllowed' }
  | { error: InvalidAccessKeyError; type: 'delegateActionAccessKeyError' }
  | { type: 'delegateActionExpired' }
  | { type: 'delegateActionInvalidSignature' }
  | UnknownError;

export type ReceiptTransactionError =
  | {
      balance: string;
      cost: string;
      signerId: string;
      type: 'notEnoughBalance';
    }
  | { akNonce: number; transactionNonce: number; type: 'invalidNonce' }
  | { amount: string; signerId: string; type: 'lackBalanceForState' }
  | { error: InvalidAccessKeyError; type: 'invalidAccessKeyError' }
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
  | UnknownError;

export type ReceiptExecutionStatusError =
  | {
      error: ReceiptActionError;
      type: 'action';
    }
  | {
      error: ReceiptTransactionError;
      type: 'transaction';
    }
  | UnknownError;

export type Action = DelegateAction | NonDelegateAction;

export type ReceiptExecutionStatus =
  | {
      error: ReceiptExecutionStatusError;
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

export type NestedReceiptWithOutcomeOld = {
  actions: Action[];
  id: string;
  outcome: {
    blockHash: string;
    gasBurnt: string;
    logs: string[];
    nestedReceipts: (FailedToFindReceipt | NestedReceiptWithOutcomeOld)[];
    status: ReceiptExecutionStatus;
    tokensBurnt: string;
  };
  predecessorId: string;
  receiverId: string;
};

export type NestedReceiptWithOutcome = Omit<
  NestedReceiptWithOutcomeOld,
  'outcome'
> & {
  outcome: Omit<
    NestedReceiptWithOutcomeOld['outcome'],
    'blockHash' | 'nestedReceipts'
  > & {
    block: {
      hash: string;
      height: string;
      timestamp: string;
    };
    nestedReceipts: (FailedToFindReceipt | NestedReceiptWithOutcome)[];
  };
};

export type ParsedReceipt = Omit<NestedReceiptWithOutcome, 'outcome'> & {
  outcome: Omit<NestedReceiptWithOutcome['outcome'], 'nestedReceipts'> & {
    receiptIds: string[];
  };
};

export type ExecutionOutcomeWithIdView = {
  block_hash: CryptoHash;
  id: CryptoHash;
  outcome: ExecutionOutcomeView;
  proof: MerklePath;
};

export type SignedTransactionView = {
  actions: Vec<ActionView>;
  hash: CryptoHash;
  nonce: Nonce;
  public_key: PublicKey;
  receiver_id: AccountId;
  signature: Signature;
  signer_id: AccountId;
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
          deposit: string;
          stake: string;
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
  className: string;
  convertionReceipt: any;
  expandAll: any;
  fellowOutgoingReceipts: any;
  receipt: any;
};

export type ReceiptKindInfo = {
  action: any;
  isTxTypeActive: boolean;
  onClick?: any;
  receipt?: any;
  receiver: string;
};
export type CommentItem = {
  accountId: string;
  blockHeight: number;
  type: string;
  value: {
    post: {
      image?: {
        ipfs_cid: string;
      };
      text?: string;
    };
  };
};
export type CommentContent = {
  image?:
    | {
        cid?: string;
        url?: string;
      }
    | undefined;
  text?: string;
  type: string;
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
  placeholder: string;
  type: string;
  value: string;
};

export type SchemaInfo = {
  body: {
    functions: {
      kind: string;
      name: string;
      params: {
        args: [
          {
            name: string;
            type_schema: {
              $ref: string;
            };
          },
        ];
        serialization_type: string;
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
      definitions: {
        AccountId: {
          description: string;
          type: string;
        };
      };
      title: String;
      type: string;
    };
  };
  metadata: {
    build: {
      builder: string;
      compiler: string;
    };
    name: string;
    version: string;
  };
  schema_version: string;
};

export type FieldValueTypes = boolean | null | number | string;

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
  shards: { shard: string; txns: string }[];
  txns: string;
};

export type AccountDataInfo = {
  account_id: string;
  amount: string;
  block_hash: string;
  block_height: string;
  code_hash: string;
  locked: string;
  storage_paid_at: string;
  storage_usage: string;
};
export type SpamToken = {
  blacklist: string[];
};

export type GuessableTypeString =
  | 'boolean'
  | 'json'
  | 'null'
  | 'number'
  | 'string';

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
  afterNextEpoch: boolean;
  currentEpoch: boolean;
  nextEpoch: boolean;
};

export type VerifierData = {
  block_height?: number;
  cid?: string;
  code_hash?: string;
  lang?: string;
};

export type VerifierStatus = 'mismatch' | 'notVerified' | 'verified';

export type VerificationData = {
  data: null | VerifierData;
  status: VerifierStatus;
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

export type ContractData = {
  base64Code: string;
  contractMetadata: ContractMetadata | null;
  onChainCodeHash: string;
};

export type MultiChainTxnInfo = {
  account_id: string;
  block_height: string;
  block_timestamp: string;
  chain: string;
  derived_address: string;
  derived_transaction: string;
  id: string;
  path: string;
  public_key: string;
  receipt_id: string;
  status: boolean;
  transaction_hash: string;
};

export type MtTransferLog = {
  amounts: string[];
  authorized_id?: string;
  memo?: string;
  new_owner_id: string;
  old_owner_id: string;
  token_ids: string[];
};

export type MtBurnLog = {
  amounts: string[];
  authorized_id?: string;
  memo?: string;
  owner_id: string;
  token_ids: string[];
};

export type MtMintLog = {
  amounts: string[];
  memo?: string;
  owner_id: string;
  token_ids: string[];
};

export type MtEventLogData = {
  data: MtBurnLog[] | MtMintLog[] | MtTransferLog[];
  event: string;
  standard: string;
  version: string;
};

export type CampaignData = {
  data?: {
    desktop_image_right_url?: string;
    icon?: string;
    is_active?: number;
    link_name?: string;
    mobile_image_url?: string;
    site_name?: string;
    start_date?: string;
    subscription?: {
      status?: string;
    };
    text?: string;
    title?: string;
    url?: string;
  };
};

export type CampaignProps = {
  campaignData: CampaignData;
  campaignId?: string;
  campaignMutate: () => void;
  loading: boolean;
  mutate: () => void;
};

export type currentCampaign = {
  click_count: number;
  id: string;
  impression_count: number;
  is_active: number;
  is_approved?: number;
  key: string;
  price_annually: number;
  price_monthly: number;
  start_date: string;
  subscription?: {
    campaign_plan?: {
      title: string;
    };
    status: string;
  };
  title: string;
  user?: {
    username: string;
  };
};

export type DexInfo = {
  base: string;
  base_meta: {
    decimals: number;
    icon: string;
    name: string;
    reference: string;
    symbol: string;
  };
  change_1d: string;
  change_1h: string;
  change_5m: string;
  change_6h: string;
  contract: string;
  id: number;
  makers: string;
  pool: 0;
  price_token: string;
  price_usd: string;
  quote: string;
  quote_meta: {
    decimals: number;
    icon: string;
    name: string;
    reference: string;
    symbol: string;
  };
  txns: string;
  volume: string;
};
