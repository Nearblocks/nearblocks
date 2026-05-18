import { createContext } from 'react';

export const RpcContext = createContext<{
  nearPrice?: null | string;
}>({
  nearPrice: null,
});
