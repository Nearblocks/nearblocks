'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Config } from '@/lib/config';
import type { Network } from '@/types/enums';

type RpcProvider = Config['provider'];

export type TimestampMode = 'age' | 'time';

type PreferencesState = {
  hasHydrated: boolean;
  networkId: Network | null;
  provider: null | RpcProvider;
  providers: RpcProvider[];
  setHasHydrated: (value: boolean) => void;
  setProvider: (provider: RpcProvider) => void;

  setTimestampMode: (mode: TimestampMode) => void;
  timestampMode: TimestampMode;
  toggleTimestampMode: () => void;
};

const STORAGE_KEY = 'nearblocks:preferences';

const findByUrl = (providers: RpcProvider[], url: string) =>
  providers.find((p) => p.url === url) ?? null;

export const usePreferences = create<PreferencesState>()(
  persist(
    (set, get) => ({
      hasHydrated: false,
      networkId: null,
      provider: null,
      providers: [],

      setHasHydrated: (value) => set({ hasHydrated: value }),
      setProvider: (provider) => {
        const state = get();
        const providers = findByUrl(state.providers, provider.url)
          ? state.providers
          : [...state.providers, provider];
        set({ provider, providers });
      },

      setTimestampMode: (mode) => set({ timestampMode: mode }),
      timestampMode: 'age',
      toggleTimestampMode: () => {
        const mode = get().timestampMode;
        set({ timestampMode: mode === 'age' ? 'time' : 'age' });
      },
    }),
    {
      name: STORAGE_KEY,
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error(error);
        }
        state?.setHasHydrated(true);
      },
      partialize: (s) => ({
        provider: s.provider,
        providers: s.providers,

        timestampMode: s.timestampMode,
      }),
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);

export const initPreferencesStore = (
  networkId: Network,
  defaultProviders: RpcProvider[],
) => {
  void (async () => {
    try {
      if (!usePreferences.persist.hasHydrated()) {
        await usePreferences.persist.rehydrate();
      }
    } catch (err) {
      console.error(err);
    } finally {
      usePreferences.getState().setHasHydrated(true);
    }

    const state = usePreferences.getState();
    const providers =
      state.providers.length > 0 ? state.providers : defaultProviders;
    const provider =
      (state.provider && findByUrl(providers, state.provider.url)) ||
      providers[0] ||
      null;

    usePreferences.setState({
      networkId,
      provider,
      providers,
    });
  })();
};
