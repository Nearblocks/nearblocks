import { RpcTransactionResponse } from '@near-js/jsonrpc-types';
import { createContext } from 'react';

import type { NearPrice } from '@/lib/txn';

export const RpcContext = createContext<{
  enableRpc: () => void;
  nearPrice?: NearPrice | null;
  rpcData: RpcTransactionResponse | undefined;
  rpcLoading: boolean;
}>({
  enableRpc: () => {},
  nearPrice: null,
  rpcData: undefined,
  rpcLoading: false,
});
