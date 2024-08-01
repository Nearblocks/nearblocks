import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { useNetworkStore } from './network';

type RpcState = {
  rpc: string;
  setRpc: (rpc: string) => void;
};

export const useRpcStore = create(
  persist<RpcState>(
    (set) => {
      const { providers } = useNetworkStore.getState();

      return {
        rpc: providers?.[0]?.url,
        setRpc: (rpc) => set({ rpc }),
      };
    },
    { name: 'rpc-url' },
  ),
);
