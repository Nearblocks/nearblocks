import type { NextPage } from 'next';
import type { ReactElement, ReactNode } from 'react';

import { ValidatorEpochData, ValidatorTelemetry } from 'nb-types';
import { supportedNetworks } from './app/config';
import { RpcTransactionResponse } from '@near-js/jsonrpc-types';

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

export type ApiMetaInfo = {
  contractId: string;
  metadata: {
    decimals: number;
    description: string;
    icon: string | null;
    marketCap: string;
    name: string;
    price: string;
    symbol: string;
    volume24h: string;
    website: string;
    tokenId?: string;
  };
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
  block_height: number;
  code_base64: string;
  hash: string;
  locked: boolean;
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
    block_timestamp: string;
    block_hash: string;
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
    result: {
      ActionError: {
        index: number;
        kind: any;
      };
    };
  };
  outcome: {
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
  blocks?: Array<{ block_hash: string; block_height: number }>;
  receipts?: Array<{
    originated_from_transaction_hash: string;
    receipt_id: string;
  }>;
  tokens: Array<{ contract: string }>;
  mtTokens: Array<{ contract: string; token_id: string }>;
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
  executorId: string;
  gasBurnt: string;
  logs: [];
  metadata: {
    gasProfile: GasProfileInfo[];
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
  receiptIds: string[];
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
  tokensBurnt: string;
};

export type OutcomeInfo = {
  blockHash: string;
  id: string;
  outcome: OutcomePropsInfo;
  proof: {
    direction: string;
    hash: string;
  }[];
};

export type ReceiptsInfo = {
  predecessorId: string;
  receipt: {
    Action: {
      actions: {
        FunctionCall: FunctionCallInfo;
      }[];
      gasPrice: string;
      inputDataIds: [];
      outputDataReceivers: [];
      signerId: string;
      signerPublicKey: string;
    };
  };
  receiptId: string;
  receiverId: string;
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
  receiptsOutcome: OutcomeInfo[];
  status: InfoStatus;
  transaction: TransInfo;
  transactionOutcome: OutcomeInfo;
};

export type TransactionLog = {
  contract: string;
  logs: any;
  receiptId?: string;
};

export type ActionType = {
  [key: string]: any;
};

export type Obj = {
  [key: string]: Obj | string;
};

export type AccountContractInfo = {
  access_key: AccessInfo;
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
  actionsLog?: any;
  allActionLog?: any;
  tokenMetadata?: ProcessedTokenMeta[];
  isInteracted?: boolean;
};

export type DepositPropsInfo = {
  event: {
    account_id: string;
    amount: string;
    token_id: string;
  }[];
  receiptId?: string;
  tokenMetadata?: ProcessedTokenMeta[];
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
  accessKey: {
    permission: {
      FunctionCall: {
        method_names: [];
        methodNames: [];
        receiverId: string;
        receiver_id: string;
      };
      permission_kind: string;
    };
  };
  access_key: {
    permission:
      | string
      | {
          FunctionCall: {
            method_names: [];
            receiver_id: string;
          };
          permission_kind: string;
        };
  };
  args: string;
  args_base64: string;
  beneficiaryId: string;
  beneficiary_id: string;
  args_json: {
    holding_account_id?: string;
    steps_batch?: any[];
    amounts?: any[];
    amount?: string;
    fee?: string;
    fee_account_id?: string;
    receiver_id?: string;
  };
  delegateAction: {
    actions: {
      FunctionCall: {
        args: string;
        deposit: string;
        gas: string;
        methodName: string;
      };
    }[];
    max_block_height: string;
    nonce: string;
    publicKey: string;
    public_key: string;
    receiverId: string;
    sender_id: string;
    senderId: string;
  };
  delegate_action: {
    actions: {
      FunctionCall: {
        args: string;
        deposit: string;
        gas: string;
        methodName: string;
      };
    }[];
    max_block_height: string;
    nonce: string;
    publicKey: string;
    public_key: string;
    receiverId: string;
    receiver_id: string;
    sender_id: string;
    senderId: string;
  };
  deposit: string;
  methodName: string;
  method_name: string;
  publicKey: string;
  public_key: string;
  stake: string;
  sender_id: string;
  senderId: string;
};

export type TransactionActionInfo = {
  action?: any;
  args: ArgsPropsInfo;
  receiver: string;
  rpcAction?: any;
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
  rpcAction?: {
    action_kind: string;
    args: ArgsPropsInfo;
  };
  key: number;
  receiver: any;
};

export type TokenInfoProps = {
  contract: string;
  amount: string;
  transferAmount?: string;
  isShowText?: boolean;
  metaInfo?: ApiMetaInfo[];
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
        accountId: AccountId;
        predecessorId: AccountId;
      };
    }
  | {
      CreateAccountOnlyByRegistrar: {
        accountId: AccountId;
        predecessorId: AccountId;
        registrarAccountId: AccountId;
      };
    }
  | {
      DelegateActionNonceTooLarge: {
        delegateNonce: Nonce;
        upperBound: Nonce;
      };
    }
  | {
      DelegateActionSenderDoesNotMatchTxReceiver: {
        receiverId: AccountId;
        senderId: AccountId;
      };
    }
  | {
      InsufficientStake: {
        accountId: AccountId;
        minimumStake: Balance;
        stake: Balance;
      };
    }
  | {
      TriesToStake: {
        accountId: AccountId;
        balance: Balance;
        locked: Balance;
        stake: Balance;
      };
    }
  | { AccountAlreadyExists: { accountId: AccountId } }
  | { AccountDoesNotExist: { accountId: AccountId } }
  | { ActorNoPermission: { accountId: AccountId; actorId: AccountId } }
  | { AddKeyAlreadyExists: { accountId: AccountId; publicKey: PublicKey } }
  | { DelegateActionAccessKeyError: InvalidAccessKeyError }
  | { DelegateActionInvalidNonce: { akNonce: Nonce; delegateNonce: Nonce } }
  | { DeleteAccountStaking: { accountId: AccountId } }
  | { DeleteAccountWithLargeState: { accountId: AccountId } }
  | { DeleteKeyDoesNotExist: { accountId: AccountId; publicKey: PublicKey } }
  | { FunctionCallError: FunctionCallError }
  | { LackBalanceForState: { accountId: AccountId; amount: Balance } }
  | { NewReceiptValidationError: NewReceiptValidationError }
  | { OnlyImplicitAccountCreationAllowed: { accountId: AccountId } }
  | { TriesToUnstake: { accountId: AccountId } };

export type InvalidTxError =
  | {
      NotEnoughBalance: {
        balance: Balance;
        cost: Balance;
        signerId: AccountId;
      };
    }
  | { ActionsValidation: unknown }
  | { CostOverflow: unknown }
  | { Expired: unknown }
  | { InvalidAccessKeyError: InvalidAccessKeyError }
  | { InvalidChain: unknown }
  // https://docs.rs/near-primitives/0.12.0/near_primitives/errors/enum.InvalidTxError.html#variant.InvalidSignature
  | { InvalidNonce: { akNonce: Nonce; txNonce: Nonce } }
  | { InvalidReceiverId: { receiverId: String } }
  | { InvalidSignature: unknown }
  | { InvalidSignerId: { signerId: String } }
  | { LackBalanceForState: { amount: Balance; signerId: AccountId } }
  | { NonceTooLarge: { txNonce: Nonce; upperBound: Nonce } }
  // https://docs.rs/near-primitives/0.12.0/near_primitives/errors/enum.ActionsValidationError.html
  | { SignerDoesNotExist: { signerId: AccountId } }
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
    beneficiaryId: AccountId;
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
  predecessorId: AccountId;
  receipt: ReceiptEnumView;
  receiptId: CryptoHash;
  receiverId: AccountId;
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
        numberOfInputDataDependencies: U64;
      };
    }
  | { ActionsValidation: ActionsValidation }
  | { InvalidDataReceiverId: { accountId: String } }
  | { InvalidPredecessorId: { accountId: String } }
  | { InvalidReceiverId: { accountId: String } }
  | { InvalidSignerId: { accountId: String } }
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
  | { CodeDoesNotExist: { accountId: AccountId } }
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
        accountId: AccountId;
        publicKey: PublicKey;
      };
    }
  | {
      MethodNameMismatch: {
        methodName: String;
      };
    }
  | {
      NotEnoughAllowance: {
        accountId: AccountId;
        allowance: Balance;
        cost: Balance;
        publicKey: PublicKey;
      };
    }
  | {
      ReceiverMismatch: {
        akReceiver: String;
        txReceiver: AccountId;
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
  receipt: any;
  fellowOutgoingReceipts: any;
  expandAll: any;
  convertionReceipt: any;
  className: string;
  statsData: {
    stats: Array<{
      near_price: string;
    }>;
  };
  rpcTxn: RpcTransactionResponse;
  polledReceipt: any;
  polledFellowOutgoingReceipts?: any;
  rpcReceipt: any;
  rpcRootReceipt?: any;
};

export type ReceiptKindInfo = {
  action: any;
  polledAction: any;
  isTxTypeActive: boolean;
  onClick?: any;
  receipt?: any;
  receiver: string;
  rpcAction: any;
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
  jobs: {
    daily_stats: {
      date: string;
      sync: boolean;
    };
  };
  aggregates: {
    ft_holders: { height: number; sync: boolean; timestamp: string };
    nft_holders: { height: number; sync: boolean; timestamp: string };
  };
  indexers: {
    balance: { height: number; sync: boolean; timestamp: string };
    base: { height: string; sync: boolean; timestamp: string };
    events: { height: number; sync: boolean; timestamp: string };
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
  global_contract_account_id?: string;
  global_contract_hash?: string;
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
    email: string;
  };
};

export enum FilterKind {
  ACTION = 'action',
  METHOD = 'method',
  FROM = 'from',
  TO = 'to',
  BLOCK = 'block',
  CHAIN = 'chain',
  MULTICHAIN_ADDRESS = 'multichain_address',
  EVENT = 'event',
  INVOLVED = 'involved',
  CONTRACT = 'contract',
  A = 'a',
  ACCOUNT = 'account',
}

export type Account = {
  account_id: string;
  amount: string;
  block_hash: string;
  block_height: number;
  code_hash: string;
  locked: string;
  storage_paid_at: number;
  storage_usage: number;
};

export type NetworkType = keyof typeof supportedNetworks;
export type UserToken = {
  exp: number;
  iat: number;
  role: string;
  sub: string;
  username: string;
};

export type BannerAdData = {
  desktopImage: string;
  id?: string;
  mobileImage: string;
};

export type TextAdData = {
  icon: string;
  id: string;
  linkName: string;
  siteName: string;
  text: string;
};

export type ActionInfo = {
  to: string;
  from: string;
  receiptId: string;
  logs: Array<{
    logs: string;
    contract: string;
    receiptId: string;
  }>;
  actionsLog: Array<{
    args: {
      deposit: number;
      gas: number;
      method_name?: string;
      args?: any;
    };
    [key: string]: any;
  }>;
  [key: string]: any;
};

export type TokenMetadata = {
  name: string;
  symbol: string;
  decimals: number;
  price: string;
  marketCap: string;
  volume24h: string;
  description: string;
  website: string;
  icon: string | null;
  tokenId?: string;
};

export type ProcessedTokenMeta = {
  contractId: string;
  metadata: TokenMetadata;
};

export type ApiTxnData = {
  apiLogs: TransactionLog[];
  apiActionLogs: any;
  apiMainActions: ActionInfo[];
  apiSubActions: ReceiptAction[];
  apiAllActions: ReceiptAction[];
  tokenMetadata: ProcessedTokenMeta[];
  receiptData: TransformedReceipt | null;
};

export type TransactionData = {
  txns: ApiTransaction[];
};

export type ApiTransaction = {
  transaction_hash: string;
  included_in_block_hash: string;
  block_timestamp: string;
  signer_account_id: string;
  receiver_account_id: string;
  receipt_conversion_gas_burnt: string;
  receipt_conversion_tokens_burnt: string;
  shard_id: string;
  block: {
    block_height: number;
  };
  actions: Action[];
  actions_agg: {
    deposit: number;
    gas_attached: number;
  };
  outcomes: {
    status: boolean;
  };
  outcomes_agg: {
    transaction_fee: number;
    gas_used: number;
  };
  receipts: ApiReceipt[];
};

export type ApiAction = {
  action: string;
  method: string;
  args: string;
  args_full: {
    gas: number;
    deposit: string;
    args_json: {
      msg: string;
      amount: string;
      receiver_id: string;
    };
    args_base64: string | null;
    method_name: string;
  };
};

export type ApiReceipt = {
  receipt_id: string;
  predecessor_account_id: string;
  receiver_account_id: string;
  receipt_kind: string;
  block: {
    block_hash: string;
    block_height: number;
    block_timestamp: number;
  };
  outcome: {
    gas_burnt: number;
    tokens_burnt: number;
    executor_account_id: string;
    status: boolean;
    logs: string[];
  };
  fts: any[];
  nfts: any[];
};

export type ReceiptTree = {
  receipt_id: string;
  predecessor_account_id: string;
  receiver_account_id: string;
  public_key: string;

  block?: {
    block_hash: string;
    block_height: number;
    block_timestamp: string;
  };

  actions?: Array<{
    action_kind: string;
    args: {
      gas?: string;
      deposit?: string;
      method_name?: string;
      args_json?: any;
      args_base64?: string | null;
    };
    rlp_hash: string | null;
  }>;

  outcome: {
    logs: string[] | null;
    result: string;
    status_key: string;
    status:
      | boolean
      | {
          SuccessValue?: string;
          SuccessReceiptId?: string;
          Failure?: { error_message: string };
        };
    gas_burnt: string;
    tokens_burnt: string;
    executor_account_id: string;
  };

  receipts?: ReceiptTree[];
};

export type TransformedReceipt = {
  receipt_id: string;
  predecessor_id: string;
  receiver_id: string;
  block_hash?: string;
  block_height: number | null;
  actions?: Array<{
    action_kind: string;
    args: {
      gas?: string;
      deposit: string;
      method_name?: string;
      args_json?: any;
      args_base64?: string | null;
    };
    rlp_hash: string | null;
  }>;

  outcome: {
    logs: string[];
    status: {
      SuccessValue?: string;
      SuccessReceiptId?: string;
      Failure?: { error_message: string };
    };
    gas_burnt?: string;
    tokens_burnt?: string;
    executor_account_id?: string;
    outgoing_receipts: TransformedReceipt[];
  };

  public_key?: string;
};

export type ReceiptApiResponse = {
  receipts: Array<{
    receipt_tree: ReceiptTree;
  }>;
};

export type ReceiptAction = {
  from: string;
  to: string;
  receiptId: string;
  action_kind: string;
  args: Record<string, any>;
};

export type FTToken = {
  amount: string;
  contract: string;
  meta: {
    contract: string;
    name: string;
    symbol: string;
    decimals: number;
    icon: string | null;
    reference: string | null;
    price: string;
  };
  token_id: string;
};

export type MTToken = {
  amount: string;
  contract: string;
  meta: {
    base: {
      name: string;
      id: string;
      symbol: string;
      icon: string;
      decimals: number;
    };
    name: string;
    id: string;
    symbol: string;
    icon: string;
    decimals: number;
    token: {
      title: string;
      description: string;
      media: string;
      issued_at: number;
      starts_at: number;
      updated_at: number;
      extra: string;
    };
  };
  token_id: string;
};

export type NFTToken = {
  amount: string;
  contract: string;
  meta: {
    spec: string;
    name: string;
    symbol: string;
    icon: string;
    base_uri: string;
    reference: string | null;
    reference_hash: string | null;
  };
  token_id: string;
};

export type Inventory = {
  fts: FTToken[];
  mts: MTToken[];
  nfts: NFTToken[];
};

export type mts = {
  inventory: Inventory;
};

export type MTTokenMeta = {
  base: {
    name: string;
    id: string;
    symbol: string;
    icon: string;
    decimals: number;
  };
  token: {
    title: string;
    description: string;
    media: string;
    issued_at: number;
    starts_at: number;
    updated_at: number;
    extra: string;
  };
};
export type RpcProvider = {
  name: string;
  url: string;
  isCustom?: boolean;
};

export type IntentsTokenPrices = {
  assetId: string;
  decimals: number;
  blockchain: string;
  symbol: string;
  price: number;
  priceUpdatedAt: string;
  contractAddress?: string;
};

export type RefFinanceTokenPrice = {
  price: string;
  symbol: string;
  decimal: number;
};

export type RefFinanceTokenPrices = {
  [contractAddress: string]: RefFinanceTokenPrice;
};
