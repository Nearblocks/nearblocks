import { RpcTransactionResponse } from '@near-js/jsonrpc-types';
import { createContext } from 'react';

export const RpcContext = createContext<{
  enableRpc: () => void;
  rpcData: RpcTransactionResponse | undefined;
  rpcLoading: boolean;
}>({
  enableRpc: () => {},
  rpcData: undefined,
  rpcLoading: false,
});
