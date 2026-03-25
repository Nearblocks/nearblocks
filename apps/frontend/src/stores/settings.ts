import { createStore } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Config } from '@/lib/config';
import type { Network } from '@/types/enums';

type RpcProvider = Config['provider'];

export type TimestampMode = 'age' | 'time';
export type UTCMode = 'local' | 'utc';

interface SettingsActions {
  addProvider: (provider: RpcProvider) => void;
  deleteProvider: (url: string) => void;
  setHydrated: (value: boolean) => void;
  setProvider: (provider: RpcProvider) => void;
  toggleTimestampMode: () => void;
  toggleUTCMode: () => void;
  updateProvider: (url: string, provider: RpcProvider) => void;
}

export interface SettingsState extends SettingsActions {
  hydrated: boolean;
  provider: null | RpcProvider;
  providers: RpcProvider[];
  timestampMode: TimestampMode;
  utcMode: UTCMode;
}

export type SettingsStore = ReturnType<typeof createSettingsStore>;

export const createSettingsStore = (
  network: Network,
  provider: RpcProvider,
) => {
  return createStore<SettingsState>()(
    persist(
      /* eslint-disable perfectionist/sort-objects */
      (set, get) => ({
        hydrated: false,
        provider,
        providers: [],
        timestampMode: 'age',
        utcMode: 'utc',
        addProvider: (provider) =>
          set((s) => ({ providers: [...s.providers, provider] })),
        deleteProvider: (url) =>
          set((s) => ({
            provider: s.provider?.url === url ? null : s.provider,
            providers: s.providers.filter((p) => p.url !== url),
          })),
        setHydrated: (hydrated) => set({ hydrated }),
        setProvider: (provider) => set({ provider }),
        updateProvider: (url, provider) =>
          set((s) => ({
            provider: s.provider?.url === url ? provider : s.provider,
            providers: s.providers.map((p) => (p.url === url ? provider : p)),
          })),
        toggleTimestampMode: () => {
          const mode = get().timestampMode;
          set({ timestampMode: mode === 'age' ? 'time' : 'age' });
        },
        toggleUTCMode: () => {
          const mode = get().utcMode;
          set({ utcMode: mode === 'local' ? 'utc' : 'local' });
        },
      }),
      /* eslint-enable perfectionist/sort-objects */
      {
        name: `nearblocks:${network}`,
        onRehydrateStorage: () => (state, error) => {
          if (error) {
            console.error('rehydration error', error);
          }
          state?.setHydrated(true);
        },
        partialize: (state) => ({
          provider: state.provider,
          providers: state.providers,
          timestampMode: state.timestampMode,
          utcMode: state.utcMode,
        }),
        storage: createJSONStorage(() =>
          typeof window !== 'undefined'
            ? localStorage
            : {
                getItem: () => null,
                removeItem: () => void 0,
                setItem: () => void 0,
              },
        ),
      },
    ),
  );
};
