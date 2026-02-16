// Type definitions for RPC transaction data

export type RpcFunctionCall = {
  args?: string;
  gas?: string | number;
  methodName?: string;
  method_name?: string;
};

export type RpcAction = {
  FunctionCall?: RpcFunctionCall;
  functionCall?: RpcFunctionCall;
};

export type RpcActionReceipt = {
  actions?: RpcAction[];
};

export type RpcReceipt = {
  receipt?: {
    Action?: RpcActionReceipt;
    action?: RpcActionReceipt;
  };
  receiptId?: string;
};

export type RpcTransactionResponseWithReceipts = {
  receipts?: RpcReceipt[];
};

export type AuroraViewFormat = 'default' | 'rlp' | 'table';

export type EvmTransactionData = {
  chainId?: string;
  data?: string;
  from?: string;
  gasLimit?: string;
  gasPrice?: string;
  hash?: string | null;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  nonce?: number;
  to?: string;
  value?: string;
};

export type AuroraSubmitArgs = {
  gas_token_address?: number[] | null | undefined;
  max_gas_price?: string | null | undefined;
  tx_data: number[];
};
