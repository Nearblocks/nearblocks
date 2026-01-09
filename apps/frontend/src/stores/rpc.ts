'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Config } from '@/lib/config';
import type { Network } from '@/types/enums';

type RpcProvider = Config['provider'];

type RpcState = {
  networkId: Network | null;
  provider: null | RpcProvider;
  providers: RpcProvider[];
  setProvider: (provider: RpcProvider) => void;
};

const STORAGE_KEY = 'nearblocks:rpc';

const findByUrl = (providers: RpcProvider[], url: string) =>
  providers.find((p) => p.url === url) ?? null;

export const useRpc = create<RpcState>()(
  persist(
    (set, get) => ({
      networkId: null,
      provider: null,
      providers: [],

      setProvider: (provider) => {
        const state = get();
        const providers = findByUrl(state.providers, provider.url)
          ? state.providers
          : [...state.providers, provider];
        set({ provider, providers });
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (s) => ({
        provider: s.provider,
        providers: s.providers,
      }),
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);

export const initRpcStore = (
  networkId: Network,
  defaultProviders: RpcProvider[],
) => {
  void (async () => {
    try {
      if (!useRpc.persist.hasHydrated()) {
        await useRpc.persist.rehydrate();
      }
    } catch (err) {
      console.error(err);
    }

    const state = useRpc.getState();
    const providers =
      state.providers.length > 0 ? state.providers : defaultProviders;
    const provider =
      (state.provider && findByUrl(providers, state.provider.url)) ||
      providers[0] ||
      null;

    useRpc.setState({
      networkId,
      provider,
      providers,
    });
  })();
};
