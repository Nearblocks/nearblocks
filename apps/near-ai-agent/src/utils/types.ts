import { supportedNetworks } from './app/config';

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

  outcome?: {
    logs: string[] | null;
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

export type ReceiptApiResponse = {
  receipts: Array<{
    receipt_tree: ReceiptTree;
  }>;
};

export type TransactionLog = {
  contract: string;
  logs: any;
  receiptId?: string;
};
export type ParsedLogArgs = {
  [key: string]: any;
};

export type ParsedTransactionLog = {
  contract: string;
  logs: any[];
  parsedActionLogs?: any;
  receiptId?: string;
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

export type Action = DelegateAction | NonDelegateAction;

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

export type EventPropsInfo = {
  event: TransactionLog;
  actionsLog?: any;
  allActionLog?: any;
  tokenMetadata?: ProcessedTokenMeta[];
  isInteracted?: boolean;
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
  type: 'wrap_deposit' | 'wrap_withdraw';
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
      type: 'wrap_deposit' | 'wrap_withdraw';
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
    }
  | {
      type: 'swap';
      amountIn: string;
      tokenIn: string;
      tokenInMeta: TokenMetadata | null;
      amountOut: string;
      tokenOut: string;
      tokenOutMeta: TokenMetadata | null;
      contract: string;
      receiptId: string;
      platform: string;
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

export type NetworkType = keyof typeof supportedNetworks;
export type UserToken = {
  exp: number;
  iat: number;
  role: string;
  sub: string;
  username: string;
};

export type FunctionCallInfo = {
  args: string;
  deposit: string;
  gas: string;
  method_name: string;
};

export type ReceiptsInfo = {
  predecessor_id: string;
  receipt:
    | {
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
      }
    | Array<any>;
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

export type ApiTransactionInfo = {
  receipts: ReceiptsInfo[];
  receipts_outcome: OutcomeInfo[];
  status: InfoStatus;
  transaction: TransInfo;
  transaction_outcome: OutcomeInfo;
};

export interface ParsedAddressLink {
  address: string;
  short: string;
  url: string;
}

export interface ParsedActioninfo {
  type: string;
  display: {
    label: string;
    from: ParsedAddressLink;
    to: ParsedAddressLink;
    methodName?: string;
  };
  raw: any;
}

export interface ParsedAction {
  type: string;
  details: Record<string, any>;
  from?: string;
  to?: string;
  receiptId?: string;
  txnHash?: string;
}
