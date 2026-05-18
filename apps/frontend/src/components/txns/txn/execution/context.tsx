import { RpcTransactionResponse } from '@near-js/jsonrpc-types';
import { createContext } from 'react';

export const RpcContext = createContext<{
  enableRpc: () => void;
  nearPrice?: null | string;
  rpcData: RpcTransactionResponse | undefined;
  rpcLoading: boolean;
}>({
  enableRpc: () => {},
  nearPrice: null,
  rpcData: undefined,
  rpcLoading: false,
});
