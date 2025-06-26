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
    }
  | {
      type: 'ref_swap';
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
export interface ParsedAction {
  type: string;
  details: Record<string, any>;
  from?: string;
  to?: string;
  receiptId?: string;
  txnHash?: string;
}
