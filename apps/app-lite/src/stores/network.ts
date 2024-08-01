import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import config from '@/config';
import { getProviders } from '@/libs/rpc';

type Network = 'mainnet' | 'testnet';

interface Rpc {
  name: string;
  url: string;
}

interface NetworkState {
  addRpc: (rpc: Rpc) => void;
  getCustomRpc: () => Rpc[];
  mainnet: Rpc[];
  network: Network;
  providers: { name: string; url: string }[];
  removeRpc: (url: string) => void;
  setNetwork: (network: Network) => void;
  testnet: Rpc[];
}

export const useNetworkStore = create<NetworkState>()(
  persist(
    (set, get) => ({
      addRpc: (rpc: Rpc) => {
        const { network } = get();

        set((state) => {
          const currentCustomRpc = state[network] || [];

          if (!currentCustomRpc.some((r) => r.url === rpc.url)) {
            return {
              ...state,
              [network]: [...currentCustomRpc, rpc],
            };
          }

          return state;
        });
      },
      getCustomRpc: () => {
        const { network } = get();

        return get()[network] || [];
      },
      mainnet: [],
      network: (config.network || 'mainnet') as Network,
      providers: getProviders(config.network || 'mainnet'),
      removeRpc: (url: string) => {
        const { network } = get();
        set((state) => ({
          ...state,
          [network]: (state[network] || []).filter((rpc) => rpc.url !== url),
        }));
      },
      setNetwork: (network: Network) => {
        set({
          network,
          providers: getProviders(network),
        });
      },
      testnet: [],
    }),
    {
      name: 'network',
      partialize: (state) => ({
        mainnet: state.mainnet,
        network: state.network,
        providers: state.providers,
        testnet: state.testnet,
      }),
    },
  ),
);
