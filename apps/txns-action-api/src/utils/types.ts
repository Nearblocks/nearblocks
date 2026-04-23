export type ActionError = {
  index: U64;
  kind: ActionErrorKind;
};
export type PublicKey = string;
type DataReceiverView = {
  data_id: CryptoHash;
  receiver_id: AccountId;
};
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
export type UnknownError = { type: 'unknown' };

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

export type Nonce = string;

type U128 = string;
type Vec<T> = T[];
type MerkleHash = CryptoHash;
type Direction = 'Left' | 'Right';
type CryptoHash = string;
type MerklePath = Vec<MerklePathItem>;
type Option<T> = null | T;
type AccountId = string;
type Gas = string;
type U32 = number;
type U64 = number;
type Balance = U128;

type ExecutionMetadataView = {
  gas_profile: Option<Vec<CostGasUsed>>;
  version: U32;
};
type MerklePathItem = {
  direction: Direction;
  hash: MerkleHash;
};

type CostGasUsed = {
  cost: String;
  cost_category: String;
  gas_used: Gas;
};

export type TransactionLog = {
  contract: string;
  logs: any;
  receiptId?: string;
};

export type ParsedTransactionLog = {
  contract: string;
  logs: any[];
  parsedActionLogs?: any;
  receiptId?: string;
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
};

export type ProcessedTokenMeta = {
  contractId: string;
  metadata: TokenMetadata;
};
export type ReceiptAction = {
  from: string;
  to: string;
  receiptId: string;
  action_kind: string;
  args: Record<string, any>;
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

export interface ParsedEvent {
  type: string;
  amount?: string;
  amountIn?: string;
  amountOut?: string;
  tokenIn?: string;
  tokenOut?: string;
  platform?: string;
  recipient?: string;
  sender?: string;
  contract: string;
  receiptId: string;

  token?: {
    symbol: string;
    name: string;
    decimals: number;
    icon?: string;
  } | null;

  tokenInMeta?: TokenMetadata | null;
  tokenOutMeta?: TokenMetadata | null;

  token_id?: string;
  account_id?: string;

  tokenMetadata?: TokenMetadataMap;

  [key: string]: any;
}

export type parsedWrap = {
  type: 'Burn' | 'Mint';
  amount: string;
  contract: string;
  receiptId: string;
  recipient?: string;
  sender?: string;
  token: {
    symbol: string;
    name: string;
    decimals: number;
    icon: string;
  } | null;
};

export type ParsedRef =
  | {
      type: 'ref_deposit' | 'ref_withdraw';
      amount: string;
      recipient?: string;
      sender?: string;
      contract: string;
      receiptId: string;
      token: {
        symbol: string;
        name: string;
        decimals: number;
        icon?: string;
      } | null;
      roles?: {
        senderLabel?: string;
        receiverLabel?: string;
      };
    }
  | {
      type: 'Swap';
      amountIn: string;
      tokenIn: string;
      tokenInMeta: TokenMetadata | null;
      amountOut: string;
      tokenOut: string;
      tokenOutMeta: TokenMetadata | null;
      contract: string;
      receiptId: string;
      platform: string;
      roles?: {
        senderLabel?: string;
        receiverLabel?: string;
      };
    };

export type TokenMetadataMap = Record<string, TokenMetadata>;

export type ParseBurrow = {
  type:
    | 'deposit'
    | 'deposit_to_reserve'
    | 'withdraw_succeeded'
    | 'increase_collateral'
    | 'decrease_collateral'
    | 'borrow'
    | 'repay';
  receiptId: string;
  data: {
    token_id: string;
    account_id: string;
    amount: string;
  };
};

export type UserToken = {
  exp: number;
  iat: number;
  role: string;
  sub: string;
  username: string;
};
export interface ParsedAction {
  type: string;
  details: Record<string, any>;
  from?: string;
  to?: string;
  receiptId?: string;
  txnHash?: string;
  roles?: {
    senderLabel?: string;
    receiverLabel?: string;
  };
}

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

export type OutcomeInfo = {
  block_hash: string;
  id: string;
  outcome: OutcomePropsInfo;
  proof: {
    direction: string;
    hash: string;
  }[];
};

export type FunctionCallInfo = {
  args: string;
  deposit: string;
  gas: string;
  method_name: string;
};
export type RPCTransactionInfo = {
  receipts: ReceiptsInfo[];
  receipts_outcome: OutcomeInfo[];
  status: InfoStatus;
  transaction: TransInfo;
  transaction_outcome: OutcomeInfo;
  raw: {
    receipts: ReceiptsInfo[];
    receipts_outcome: OutcomeInfo[];
    transaction: TransInfo;
    transaction_outcome: OutcomeInfo;
    status: InfoStatus;
  };
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

export type Action = DelegateAction | NonDelegateAction;

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

export type ReceiptApiResponse = {
  receipts: Array<{
    receipt_tree: ReceiptTree;
  }>;
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

export type ExecutionOutcomeView = {
  executor_id: AccountId;
  gas_burnt: Gas;
  logs: Vec<String>;
  metadata: ExecutionMetadataView;
  receipt_ids: Vec<CryptoHash>;
  status: ExecutionStatusView;
  tokens_burnt: Balance;
};

export type ExecutionOutcomeWithIdView = {
  block_hash: CryptoHash;
  id: CryptoHash;
  outcome: ExecutionOutcomeView;
  proof: MerklePath;
};
