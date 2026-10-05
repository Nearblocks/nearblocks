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
      const providers = useNetworkStore.getState().providers;

      return {
        rpc: providers?.[0]?.url,
        setRpc: (rpc) => set({ rpc }),
      };
    },
    {
      migrate: (persisted) => {
        const state = persisted as RpcState;
        const { getCustomRpc, providers } = useNetworkStore.getState();
        const known = [...providers, ...getCustomRpc()].some(
          (rpc) => rpc.url === state.rpc,
        );

        return known ? state : { ...state, rpc: providers[0].url };
      },
      name: 'rpc-url',
      version: 1,
    },
  ),
);
